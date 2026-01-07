import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
    assignReliefTeacher,
    createReliefAssignmentsForAbsenceHandler,
    getAvailableReliefTeachers,
    getReliefAssignments,
    getTeacherReliefDuties,
    updateReliefStatus
} from "../controllers/reliefAssignmentController.js";

const reliefAssignmentRouter = express.Router();


reliefAssignmentRouter.post("/:absenceId/create",userAuth,createReliefAssignmentsForAbsenceHandler);
reliefAssignmentRouter.post("/:id/assign",userAuth,assignReliefTeacher);
reliefAssignmentRouter.get("/",userAuth,getReliefAssignments);
reliefAssignmentRouter.get("/available",userAuth,getAvailableReliefTeachers);
reliefAssignmentRouter.get("/my-duties", userAuth, getTeacherReliefDuties);
reliefAssignmentRouter.patch("/:id/status", userAuth, updateReliefStatus);

export default reliefAssignmentRouter;







