import express from "express";
import { getTeacherSettings, updateTeacherSettings } from "../controllers/teacherSettingsController.js";
import userAuth from "../middleware/userAuth.js";

const teacherSettingsRouter = express.Router();

// Route to get profile data
teacherSettingsRouter.get("/profile", userAuth, getTeacherSettings);

// Route to update profile data
teacherSettingsRouter.patch("/update-profile", userAuth, updateTeacherSettings);

export default teacherSettingsRouter;