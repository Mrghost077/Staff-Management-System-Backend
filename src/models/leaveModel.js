import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    teacherId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    leaveType: { 
        type: String, 
        enum: ['Annual Leave', 'Medical Leave', 'Personal Leave', 'Emergency Leave'],
        required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    // Storing file metadata (path and name)
    documents: [{
        fileName: String,
        filePath: String,
    }],
    totalDays: { type: Number, required: true },
    appliedAt: { type: Date, default: Date.now }
});

const leaveModel = mongoose.models.leave || mongoose.model('leave', leaveSchema);
export default leaveModel;