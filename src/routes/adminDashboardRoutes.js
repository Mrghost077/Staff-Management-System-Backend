import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getTodayAttendanceSummary, getTodayTeacherAvailability } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/stats/today-summary", userAuth, getTodayAttendanceSummary);
router.get("/availability/today", userAuth, getTodayTeacherAvailability);

export default router;
