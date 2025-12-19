import mongoose from "mongoose";

const reliefAssignmentSchema = new mongoose.Schema({
    date: {type: Date, required: true},
    day: {type: String, required: true},
    period: {type: Number, required: true},
    grade: {type: String, required: true},
    subject: {type: String, required: true},

    absentTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    reliefTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },

    status: {
        type: String,
        enum: ["unassigned", "assigned"],
        default: "unassigned"
    },

    createdAt: {type: Date, default: Date.now}
});

// preventing dupliacte entries for same class same period same date
reliefAssignmentSchema.index(
    {date: 1, grade: 1, period: 1},
    {unique: true}
);

const ReliefAssignment = mongoose.models.ReliefAssignment || mongoose.model("ReliefAssignment", reliefAssignmentSchema);

export default ReliefAssignment;