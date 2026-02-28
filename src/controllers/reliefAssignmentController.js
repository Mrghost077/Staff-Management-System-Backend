import Absence from "../models/absenceModel.js";
import Attendance from "../models/attendanceModel.js";
import Timetable from "../models/timetable.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";
import userModel from "../models/userModel.js";
import sendEmail from "../config/sendEmail.js";
import { RELIEF_REASSIGNMENT_CANCELLATION, RELIEF_ASSIGNED } from "../config/emailTemplate.js";

// Service: generate relief assignments for a given absence
export const createReliefAssignmentsForAbsence = async (attendanceId) => {
    // 1. Find the attendance record
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) throw new Error("Attendance record not found");

    // 2. FIX: Convert String Date to "Monday", "Tuesday", etc.
    // If your date is "2026-01-06", this converts it correctly
    const dayOfWeek = new Date(attendance.date).toLocaleDateString("en-US", {
        weekday: "long"
    });

    // 3. Find the classes this teacher was supposed to teach today
    const timetableEntries = await Timetable.find({
        teacher: attendance.teacher,
        dayOfWeek: dayOfWeek
    });

    if (!timetableEntries.length) return [];

    // 4. Create a Relief Assignment for every period they are missing
    const creationPromises = timetableEntries.map((slot) =>
        ReliefAssignment.findOneAndUpdate(
            { attendance: attendanceId, period: slot.period }, 
            {
                attendance: attendanceId,
                originalTeacher: attendance.teacher,
                grade: slot.grade ? String(slot.grade) : "",
                subject: slot.subject,
                dayOfWeek: slot.dayOfWeek,
                period: slot.period,
                reliefTeacher: null,
                status: "pending"
            },
            { upsert: true, new: true }
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

        // 3. Find Assignment 
        const assignment = await ReliefAssignment.findById(id)
            .populate('attendance') 
            .populate('reliefTeacher', 'name email');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Relief assignment not found"
            });
        }

        // DATE EXTRACTION 
        const rawDate = assignment.attendance?.date || assignment.date;
        const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : "Scheduled Date";

        // Store reference to the old teacher before overwriting
        const oldTeacher = assignment.reliefTeacher;

        // 4. Validating the New Relief Teacher
        const newTeacher = await userModel.findById(teacherId);
        if (!newTeacher || newTeacher.role !== "teacher") {
            return res.status(404).json({
                success: false,
                message: "Relief teacher not found"
            });
        }

        // 5. Prevent original teacher from covering their own class
        if (String(newTeacher._id) === String(assignment.originalTeacher)) {
            return res.status(400).json({
                success: false,
                message: "Original teacher cannot be assigned as relief"
            });
        }

        // 6. Conflict Check: Timetable
        const conflict = await Timetable.findOne({
            teacher: teacherId,
            dayOfWeek: assignment.dayOfWeek,
            period: assignment.period
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "Teacher has a scheduled class during this period"
            });
        }

        // 7. Conflict Check: Other Relief Assignments
        const reliefConflict = await ReliefAssignment.findOne({
            _id: { $ne: id }, 
            reliefTeacher: teacherId,
            dayOfWeek: assignment.dayOfWeek,
            period: assignment.period,
            status: "assigned"
        });

        if (reliefConflict) {
            return res.status(409).json({
                success: false,
                message: "Teacher is already assigned to another relief duty in this slot"
            });
        }

        // 8. Update Database
        assignment.reliefTeacher = teacherId;
        assignment.status = "assigned";
        await assignment.save();

        // 9. Notification A: Notify the OLD teacher if they are being replaced
        if (oldTeacher && String(oldTeacher._id) !== String(teacherId)) {
            try {
                await sendEmail({
                    to: oldTeacher.email,
                    subject: `Relief Duty Cancelled: Period ${assignment.period}`,
                    html: RELIEF_REASSIGNMENT_CANCELLATION(oldTeacher.name, dateStr, assignment.period)
                });
            } catch (mailError) {
                console.error("Cancellation Email Failed:", mailError.message);
            }
        }

        // 10. Notification B: Notify the NEW teacher
        try {
            await sendEmail({
                to: newTeacher.email,
                subject: `Relief Assignment Update: Period ${assignment.period}`,
                html: RELIEF_ASSIGNED(newTeacher.name, dateStr, assignment)
            });
        } catch (mailError) {
            console.error("Assignment Email Failed:", mailError.message);
        }

        return res.status(200).json({
            success: true,
            message: "Relief teacher assigned and notified successfully",
            data: assignment
        });

    } catch (error) {
        console.error("Assignment Error:", error); 
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
            .populate("attendance")
            .sort({ createdAt: -1 })

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
        const { period, dayOfWeek, date, excludeTeacherId } = req.query;

        if (!period || !dayOfWeek || !date) {
            return res.status(400).json({
                success: false,
                message: "period, dayOfWeek, and date are required"
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
        const searchDate = new Date(date);
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

        // 2. BUSY: Teachers with scheduled classes
        const busyTeacherIds = await Timetable.find({
            dayOfWeek,
            period: numericPeriod
        }).distinct("teacher");

        // 3. BUSY: Teachers already assigned a relief duty for this specific period
        const assignedReliefDocs = await ReliefAssignment.find({
            period: numericPeriod,
            status: "assigned"
        }).populate({
            path: 'attendance', 
            match: { date: { $gte: startOfDay, $lte: endOfDay } }
        });

        const assignedReliefIds = assignedReliefDocs
            .filter(doc => doc.attendance)
            .map(doc => doc.reliefTeacher?.toString())
            .filter(Boolean);

        // 4. LEAVE: Find ALL teachers who are marked as absent today
        const absentTeacherIds = await Absence.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).distinct("teacher");

        // 5. Combine and remove duplicates
        const unavailable = Array.from(new Set([
            ...busyTeacherIds.map(id => id.toString()),
            ...assignedReliefIds,
            ...absentTeacherIds.map(id => id.toString()),
            excludeTeacherId?.toString() 
        ])).filter(Boolean);

        // 6. Find Available: Any teacher NOT in the unavailable list
        const availableTeachers = await userModel.find({
            role: "teacher",
            _id: { $nin: unavailable }
        }).select("name email _id subject");

        return res.status(200).json({
            success: true,
            data: availableTeachers
        });

    } catch (error) {
        console.error("DEBUG ERROR:", error); 
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get duties specifically for the logged-in teacher
export const getTeacherReliefDuties = async (req, res) => {
    try {
        const userId = req.userId; // Extracted from token by middleware

        const duties = await ReliefAssignment.find({ reliefTeacher: userId })
            .populate("attendance") // To get the date
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({ success: true, data: duties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Allow teacher to update status (e.g., "assigned" -> "completed")
export const updateReliefStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedDuty = await ReliefAssignment.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );

        if (!updatedDuty) {
            return res.status(404).json({ success: false, message: "Duty not found" });
        }

        res.status(200).json({ success: true, message: "Status updated", data: updatedDuty });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
