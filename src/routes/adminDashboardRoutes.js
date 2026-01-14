import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getTodayAttendanceSummary,
  getTodayTeacherAvailability,
  getTeacherAvailabilityByDate
} from "../controllers/adminDashboardController.js";

const router = express.Router();

/**
 * ================================
 * Admin Dashboard Routes
 * ================================
 */

// 1️⃣ Get Today’s Attendance Summary
//    Includes: total teachers, attendance stats, pending leave, pending relief
router.get("/stats/today-summary", userAuth, getTodayAttendanceSummary);

// 2️⃣ Get Today’s Teacher Availability
//    Returns list of teachers with their attendance status for today
router.get("/availability/today", userAuth, getTodayTeacherAvailability);

// 3️⃣ Get Teacher Availability by Specific Date
//    Returns list of teachers with their attendance status for a given date
router.get("/availability", userAuth, getTeacherAvailabilityByDate);

export default router;
