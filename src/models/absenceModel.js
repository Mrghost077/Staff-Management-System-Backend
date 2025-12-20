import mongoose from "mongoose";

const absenceSchema = new mongoose.Schema({
    // teacher 
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    date: {type: Date, required: true},
    reason: {type: String, default: ""},
    createdAt: {type: Date, default: Date.now}
});

// to avoid multiple absence entries of the same teacher on same day
absenceSchema.index({ teacher: 1, date : 1}, {unique : true});

const Absence = mongoose.models.Absence || mongoose.model("Absence", absenceSchema);

export default Absence;