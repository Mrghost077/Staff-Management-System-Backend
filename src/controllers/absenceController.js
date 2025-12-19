import Absence from "../models/absenceModel.js";
import userModel from "../models/userModel.js";

// Controller for admin to mark teacher as absent
export const markTeacherAbsent = async (req,res) => {
    try{
        const adminId = req.userId;
        const {teacherId, date, reason } = req.body;

        //validating input
        if(!teacherId || !date){
            return res.status(400).json({
                success: false,
                message: "Teacher ID and date are compulsory"
            });
        }

        // checking admin
        const admin = await userModel.findById(adminId);
        if (!admin || admin.role !== "admin") {
             return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }

        // Vaidating teacher 
        const teacher = await userModel.findById(teacherId);
        if(!teacher || teacher.role !== "teacher"){
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        // Normalizing date 
        const absenceDate = new Date(date);
        absenceDate.setHours(0, 0, 0, 0);

        // creating absence
        const absence = await Absence.create({
            teacher : teacherId,
            date: absenceDate,
            reason: reason || ""
        });

        return res.status(201).json({
            success: true,
            message: "Teacher marked as absent", 
            absence
        });
    }
    catch(error){
        // handling dupliacate absence
        if (error.code === 11000){
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