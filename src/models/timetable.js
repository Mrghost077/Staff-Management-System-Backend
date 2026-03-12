import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
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
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      required: true
    },
    period: {
      type: Number,
      min: 1,
      max: 8,
      required: true
    }
  },
  { timestamps: true }
);

/* prevent same teacher same time */
timetableSchema.index(
  { teacher: 1, dayOfWeek: 1, period: 1 },
  { unique: true }
);

export default mongoose.model("Timetable", timetableSchema);
