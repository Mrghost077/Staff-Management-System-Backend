import Absence from "../models/absenceModel.js";
import userModel from "../models/userModel.js";
import { createReliefAssignmentsForAbsence } from "./reliefAssignmentController.js";

// Controller for admin to mark teacher as absent
export const markTeacherAbsent = async (req, res) => {
    try {
        const adminId = req.userId;
        const { teacherId, date, reason } = req.body;

        // 1. Validate input
        if (!teacherId || !date) {
            return res.status(400).json({
                success: false,
                message: "Teacher ID and date are compulsory"
            });
        }

        // 2. Check admin
        const admin = await userModel.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }

        // 3. Validate teacher
        const teacher = await userModel.findById(teacherId);
        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        // 4. Normalize date
        const absenceDate = new Date(date);
        absenceDate.setHours(0, 0, 0, 0);

        // 5. Create absence
        const absence = await Absence.create({
            teacher: teacherId,
            date: absenceDate,
            reason: reason || ""
        });

        // 6. Auto-create relief assignments for this absence
        await createReliefAssignmentsForAbsence(absence._id);

        return res.status(201).json({
            success: true,
            message: "Teacher marked absent and relief assignments created",
            absence
        });

    } catch (error) {

        // Handle duplicate absence
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Absence already recorded for this teacher today"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
