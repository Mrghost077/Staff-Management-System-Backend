import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    title: {type: String, required: true},

    message: {type: String, required: true},

    type: {
      type: String,
      enum: ["ABSENCE","RELIEF_ASSIGNED","ANNOUNCEMENT","SYSTEM"],
      required: true
    },

    isRead: {type: Boolean, default: false}
  },

  { timestamps: true }
  
);

const notificationModel =mongoose.models.notification || mongoose.model("notification", notificationSchema);

export default notificationModel;
