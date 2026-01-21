import express from "express";
import {
  getAdminProfile,
  updateAdminProfile,
  getAllTeachers,
  deleteTeacher,
  updateAdminAvatar,
} from "../controllers/adminSettingsController.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

adminRouter.get("/data", adminAuth, getAdminProfile);

adminRouter.patch("/update", adminAuth, updateAdminProfile);
adminRouter.post("/update-avatar", adminAuth, updateAdminAvatar);
adminRouter.get("/teachers", adminAuth, getAllTeachers);
adminRouter.delete("/teachers/:id", adminAuth, deleteTeacher);

export default adminRouter;
