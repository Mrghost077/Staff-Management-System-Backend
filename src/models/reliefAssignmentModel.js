import mongoose from "mongoose";

const reliefAssignmentSchema = new mongoose.Schema({
    
    // related absence
    absence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Absence",
        required: true
    },

    // Class Context
    grade: {type: String, required : true},
    subject: {type: String, required: true},

    // period time slots
    timeSlot: {
        type: Number,

        // school has 8 periods
        enum: [1,2,3,4,5,6,7,8], 
        required: true
    },

    // Original Teaacher data who is absent
    absentTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    // Assigned  teacher for relief
    reliefTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },

    // Assignment Status
    status: {
        type: String,
        enum: ["unassigned", "assigned"],
        default: "unassigned"
    },

    date: {type: Date, required: true},
    createdAt: {type: Date, default: Date.now}

});

// preventing double booking same relief spot
reliefAssignmentSchema.index(
  { date: 1, grade: 1, subject: 1, timeSlot: 1 },
  { unique: true }
);

const ReliefAssignment = mongoose.models.ReliefAssignment || mongoose.model("ReliefAssignment", reliefAssignmentSchema);

export default ReliefAssignment;