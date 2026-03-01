import express from "express";
import { getTeacherSettings, updateTeacherSettings, resetTeacherPassword, updateAvatar,} from "../controllers/teacherSettingsController.js";
import userAuth from "../middleware/userAuth.js";

const teacherSettingsRouter = express.Router();

teacherSettingsRouter.get("/profile", userAuth, getTeacherSettings);
teacherSettingsRouter.patch("/update-profile", userAuth, updateTeacherSettings);
teacherSettingsRouter.post("/reset-password", userAuth, resetTeacherPassword);
teacherSettingsRouter.post("/update-avatar", userAuth,  updateAvatar);

export default teacherSettingsRouter;