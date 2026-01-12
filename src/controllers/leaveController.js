import leaveModel from "../models/leaveModel.js";

// to apply leave
export const applyLeave = async (req, res) => {
    try {
        
        const userId = req.userId;

        const { leaveType, startDate, endDate, reason } = req.body;
        
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.json({ success: false, message: "All fields are required" });
        }

        //  Calculating days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

        //  Processing Files
        const documentFiles = req.files.map(file => ({
            fileName: file.originalname,
            filePath: file.path
        }));

        // Saving to DB
        const newLeave = new leaveModel({
            teacherId: userId,
            leaveType,
            startDate,
            endDate,
            reason,
            totalDays,
            documents: documentFiles
        });

        await newLeave.save();
        res.json({ success: true, message: "Leave applied successfully!" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// to get all the leaves of the logged in teacher
export const getMyLeaves = async (req, res) => {
    try {
        const teacherIdFromToken = req.userId; 

        if (!teacherIdFromToken) {
            return res.json({ success: false, message: "Teacher ID not found" });
        }

        const leaves = await leaveModel.find({ teacherId: teacherIdFromToken }).sort({ appliedAt: -1 });

        res.json({ success: true, leaves });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Fetch all leaves with teacher details for Admin
export const getAllLeaves = async (req, res) => {
    try {

        const leaves = await leaveModel.find({})
            .populate('teacherId', 'name subject') 
            .sort({ appliedAt: -1 });

        
        const formattedLeaves = leaves.map(leave => ({
            _id: leave._id,
            teacher: {
                name: leave.teacherId?.name,
                subject: leave.teacherId?.subject,
                initials: leave.teacherId?.name?.split(' ').map(n => n[0]).join('')
            },
            type: leave.leaveType, 
            startDate: leave.startDate,
            endDate: leave.endDate,
            days: leave.totalDays, 
            reason: leave.reason,
            status: leave.status,
            documents: leave.documents
        }));

        res.json({ success: true, data: formattedLeaves }); 
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Fetch Statistics for leave management Admin Dashboard
export const getLeaveStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = {
            pendingRequests: await leaveModel.countDocuments({ status: 'Pending' }),
            approvedToday: await leaveModel.countDocuments({ 
                status: 'Approved', 
                appliedAt: { $gte: today } 
            }),
            rejectedToday: await leaveModel.countDocuments({ 
                status: 'Rejected', 
                appliedAt: { $gte: today } 
            }),
            averageResponse: 1.5 
        };

        res.json({ success: true, data: stats }); 
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// to update status as accepted or rejected
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // to get update document back
        const updatedLeave = await leaveModel.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true } 
        );

        if (!updatedLeave) {
            return res.status(404).json({ 
                success: false, 
                message: "Leave request not found" 
            });
        }

        res.json({ 
            success: true, 
            message: `Leave has been ${status.toLowerCase()} successfully`,
            data: updatedLeave
        });
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};