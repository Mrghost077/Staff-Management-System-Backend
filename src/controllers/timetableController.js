import Timetable from "../models/timetable.js";
import userModel from "../models/userModel.js";

/* =========================================================
   GET ALL TEACHERS (USED BY TIMETABLE UI)
   ========================================================= */
export const getTeachersForTimetable = async (req, res) => {
  try {
    const teachers = await userModel
      .find({ role: "teacher" })
      .select("_id name");

    return res.status(200).json({
      success: true,
      data: teachers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================================
   CREATE TIMETABLE
   ========================================================= */
export const createTimetable = async (req, res) => {
  try {
    const { teacher, grade, subject, dayOfWeek, period } = req.body;

    const teacherExists = await userModel.findById(teacher);
    if (!teacherExists || teacherExists.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const timetable = await Timetable.create({
      teacher,
      grade,
      subject,
      dayOfWeek,
      period
    });

    return res.status(201).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Teacher already has a class at this time"
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================================
   GET ALL TIMETABLES
   ========================================================= */
export const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate("teacher", "name")
      .sort({ dayOfWeek: 1, period: 1 });

    return res.status(200).json({
      success: true,
      data: timetables
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================================
   GET TIMETABLE BY TEACHER
   ========================================================= */
export const getTimetableByTeacher = async (req, res) => {
  try {
    const timetables = await Timetable.find({
      teacher: req.params.teacherId
    })
      .populate("teacher", "name")
      .sort({ dayOfWeek: 1, period: 1 });

    return res.status(200).json({
      success: true,
      data: timetables
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================================
   NEW: DELETE TIMETABLE ENTRY BY ID
   ========================================================= */
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and verify the timetable entry exists
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found"
      });
    }

    // Delete the entry
    await Timetable.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Timetable entry deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

