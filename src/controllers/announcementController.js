import Announcement from '../models/announcementModel.js'
import userModel from "../models/userModel.js";
import sendEmail from "../config/sendEmail.js";
import { ANNOUNCEMENT_TEMPLATE } from '../config/emailTemplate.js';

// CREATE announcement
// CREATE announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, category, author } = req.body

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority,
      category,
      author,
    })

    const teachers = await userModel.find({ role: 'teacher' }).select('email');
    const recipientEmails = teachers.map(teacher => teacher.email);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: recipientEmails.join(','), 
      subject: `School Announcement: ${title}`,
      html: ANNOUNCEMENT_TEMPLATE(title, content, category, priority),
    };


    try {
        await sendEmail(mailOptions);
      } catch (emailErr) {
        console.error('Email failed to send, but announcement was created:', emailErr);
        // We don't return an error response here because the announcement WAS created
      }

    res.status(201).json(announcement)
  } catch (err) {
    console.error('Create announcement error:', err)
    res.status(500).json({ message: err.message })
  }
}


// GET all announcements (with filters)
export const getAnnouncements = async (req, res) => {
  try {
    const { search, priority, category } = req.query
    let query = {}

    if (search) {
      query.title = { $regex: search, $options: 'i' }
    }
    if (priority && priority !== 'All') {
      query.priority = priority
    }
    if (category && category !== 'All') {
      query.category = category
    }

    const announcements = await Announcement.find(query).sort({
      createdAt: -1,
    })

    res.json(announcements)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET single announcement
export const getAnnouncementById = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id)
    if (!ann) return res.status(404).json({ message: 'Announcement not found' })
    res.json(ann)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// UPDATE announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(ann)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id)
    res.json({ message: 'Announcement removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
