import express from "express";
import {
    getAdminProfile,
    updateAdminProfile,
    getAllTeachers,
    updateTeacher,
    deleteTeacher,
    updateTeacherPassword
} from "../controllers/adminSettingsController.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

adminRouter.get("/data", adminAuth, getAdminProfile);


adminRouter.patch("/update", adminAuth, updateAdminProfile);
adminRouter.get("/teachers", adminAuth, getAllTeachers);
adminRouter.patch("/teachers/:id", adminAuth, updateTeacher);
adminRouter.delete("/teachers/:id", adminAuth, deleteTeacher);
adminRouter.patch("/teachers/:id/password", adminAuth, updateTeacherPassword);

export default adminRouter;