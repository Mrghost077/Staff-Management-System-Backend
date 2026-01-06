import express from "express";
import {
  getTeachersForTimetable,
  createTimetable,
  getAllTimetables,
  getTimetableByTeacher,
  deleteTimetable // NEW: Import delete function
} from "../controllers/timetableController.js";

const router = express.Router();

/* 🔹 Teacher list for dropdown */
router.get("/teachers", getTeachersForTimetable);

/* 🔹 Timetable CRUD */
router.post("/", createTimetable);
router.get("/", getAllTimetables);
router.get("/teacher/:teacherId", getTimetableByTeacher);
router.delete("/:id", deleteTimetable); // NEW: DELETE endpoint

export default router;

