import express from "express";
import { getTeacherPersonalReports } from "../controllers/teacherReportController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/my-reports", userAuth, getTeacherPersonalReports);

export default router;