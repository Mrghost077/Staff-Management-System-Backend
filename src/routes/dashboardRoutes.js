import express from "express";
import { getTeacherDashboard } from "../controllers/dashboardController.js";
import userAuth from "../middleware/userAuth.js";


const router = express.Router();

router.get("/teacher/dashboard", userAuth, getTeacherDashboard);

export default router;
