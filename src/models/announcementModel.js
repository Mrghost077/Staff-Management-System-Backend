import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['normal', 'high'],
      default: 'normal',
    },
    category: {
      type: String,
      enum: ['Meeting', 'Technology', 'Schedule', 'Safety', 'Development'],
      required: true,
    },
    author: {
      type: String,
      default: 'Admin',
    },
    readBy: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
)

const Announcement = mongoose.model('Announcement', announcementSchema)
export default Announcement
