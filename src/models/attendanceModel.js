import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    // Link to your existing user model
    teacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    // We store these here so even if a user's name changes, 
    // old attendance records stay accurate for that day
    teacherName: { type: String, required: true },
    subject: { type: String, default: 'General' }, 
    
    date: { 
        type: String, 
        required: true 
    }, // Storing as 'YYYY-MM-DD' makes searching by date much easier
    
    status: { 
        type: String, 
        enum: ['unmarked', 'present', 'late', 'leave'],
        default: 'unmarked' 
    },
    checkIn: { type: String, default: '' },  
    checkOut: { type: String, default: '' }, 
}, { timestamps: true });

// This ensures a teacher cannot have two attendance records for the same day
attendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

const attendanceModel = mongoose.models.attendance || mongoose.model('attendance', attendanceSchema);

export default attendanceModel;