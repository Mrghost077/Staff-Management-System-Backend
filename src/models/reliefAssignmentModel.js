import mongoose from "mongoose";

const reliefAssignmentSchema = new mongoose.Schema(
    {
        absence: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Absence",
            required: true
        },

        originalTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        reliefTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null
        },

        grade: {
            type: String,
            required: true
        },

        subject: {
            type: String,
            required: true
        },

        dayOfWeek: {
            type: String,
            required: true
        },

        period: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "assigned"],
            default: "pending"
        }
    },
    { timestamps: true }
);

// Prevent duplicate relief entries for the same absence and period
reliefAssignmentSchema.index({ absence: 1, period: 1 }, { unique: true });

const ReliefAssignment =
    mongoose.models.ReliefAssignment ||
    mongoose.model("ReliefAssignment", reliefAssignmentSchema);

export default ReliefAssignment;


