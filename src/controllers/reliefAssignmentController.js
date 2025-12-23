import Absence from "../models/absenceModel.js";
import Timetable from "../models/timetable.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";
import userModel from "../models/userModel.js";

// Service: generate relief assignments for a given absence
export const createReliefAssignmentsForAbsence = async (absenceId) => {
    const absence = await Absence.findById(absenceId);
    if (!absence) {
        const error = new Error("Absence not found");
        error.statusCode = 404;
        throw error;
    }

    const dayOfWeek = absence.date.toLocaleDateString("en-US", {
        weekday: "long"
    });

    const timetableEntries = await Timetable.find({
        teacher: absence.teacher,
        dayOfWeek
    });

    if (!timetableEntries.length) {
        return [];
    }

    const creationPromises = timetableEntries.map((slot) =>
        ReliefAssignment.findOneAndUpdate(
            { absence: absenceId, period: slot.period },
            {
                absence: absenceId,
                originalTeacher: absence.teacher,
                grade: slot.grade ? String(slot.grade) : "",
                subject: slot.subject,
                dayOfWeek: slot.dayOfWeek,
                reliefTeacher: null,
                status: "pending"
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
    );

    return Promise.all(creationPromises);
};

// Handler: admin-triggered creation endpoint
export const createReliefAssignmentsForAbsenceHandler = async (req, res) => {
    try {
        const { absenceId } = req.params;
        const requester = await userModel.findById(req.userId);

        if (!requester || requester.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }

        const assignments = await createReliefAssignmentsForAbsence(absenceId);

        return res.status(201).json({
            success: true,
            message: "Relief assignments generated",
            data: assignments
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message =
            error.code === 11000
                ? "Relief assignments already exist for this absence and period"
                : error.message;

        return res.status(statusCode).json({ success: false, message });
    }
};

// Assign a teacher to a specific relief assignment (admin only)
export const assignReliefTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherId } = req.body;

        if (!teacherId) {
            return res.status(400).json({
                success: false,
                message: "teacherId is required"
            });
        }

        const requester = await userModel.findById(req.userId);
        if (!requester || requester.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }

        const assignment = await ReliefAssignment.findById(id);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Relief assignment not found"
            });
        }

        if (assignment.status === "assigned" && assignment.reliefTeacher) {
            return res.status(409).json({
                success: false,
                message: "Relief teacher already assigned for this slot"
            });
        }

        const teacher = await userModel.findById(teacherId);
        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({
                success: false,
                message: "Relief teacher not found"
            });
        }

        if (String(teacher._id) === String(assignment.originalTeacher)) {
            return res.status(400).json({
                success: false,
                message: "Original teacher cannot be assigned as relief"
            });
        }

        // Check timetable conflicts for the relief teacher
        const conflict = await Timetable.findOne({
            teacher: teacherId,
            dayOfWeek: assignment.dayOfWeek,
            period: assignment.period
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "Teacher is not available during this period"
            });
        }

        // Ensure the teacher is not already assigned to another relief at this time
        const reliefConflict = await ReliefAssignment.findOne({
            reliefTeacher: teacherId,
            dayOfWeek: assignment.dayOfWeek,
            period: assignment.period,
            status: "assigned"
        });

        if (reliefConflict) {
            return res.status(409).json({
                success: false,
                message: "Teacher is already assigned to another relief"
            });
        }

        assignment.reliefTeacher = teacherId;
        assignment.status = "assigned";
        await assignment.save();

        return res.status(200).json({
            success: true,
            message: "Relief teacher assigned successfully",
            data: assignment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Fetch relief assignments (admin = all, teacher = own)
export const getReliefAssignments = async (req, res) => {
    try {
        const requester = await userModel.findById(req.userId);
        if (!requester) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const query =
            requester.role === "admin"
                ? {}
                : {
                      $or: [
                          { originalTeacher: requester._id },
                          { reliefTeacher: requester._id }
                      ]
                  };

        const assignments = await ReliefAssignment.find(query)
            .populate({ path: "originalTeacher", select: "-password -verifyOtp -resetOtp -resetOtpExpireAt -verifyOtpExpireAt" })
            .populate({ path: "reliefTeacher", select: "-password -verifyOtp -resetOtp -resetOtpExpireAt -verifyOtpExpireAt" })
            .populate("absence")
            .sort({ dayOfWeek: 1, period: 1 });

        return res.status(200).json({
            success: true,
            message: "Relief assignments fetched",
            data: assignments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Find available teachers for a given period and grade
export const getAvailableReliefTeachers = async (req, res) => {
    try {
        const { period, grade, dayOfWeek } = req.query;

        if (!period || !grade || !dayOfWeek) {
            return res.status(400).json({
                success: false,
                message: "period, grade, and dayOfWeek are required"
            });
        }

        const requester = await userModel.findById(req.userId);
        if (!requester || requester.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }

        const numericPeriod = Number(period);
        if (Number.isNaN(numericPeriod)) {
            return res.status(400).json({
                success: false,
                message: "period must be a number"
            });
        }

        // Teachers busy with their own classes
        const busyTeacherIds = await Timetable.find({
            dayOfWeek,
            period: numericPeriod
        }).distinct("teacher");

        // Teachers already assigned to relief at the same time
        const assignedReliefIds = await ReliefAssignment.find({
            dayOfWeek,
            period: numericPeriod,
            status: "assigned"
        }).distinct("reliefTeacher");

        const unavailable = [
            ...busyTeacherIds.map(String),
            ...assignedReliefIds.map(String)
        ];

        const availableTeachers = await userModel.find({
            role: "teacher",
            _id: { $nin: unavailable }
        });

        return res.status(200).json({
            success: true,
            message: "Available relief teachers fetched",
            data: availableTeachers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

