import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
    assignReliefTeacher,
    createReliefAssignmentsForAbsenceHandler,
    getAvailableReliefTeachers,
    getReliefAssignments
} from "../controllers/reliefAssignmentController.js";

const reliefAssignmentRouter = express.Router();


reliefAssignmentRouter.post("/:absenceId/create",userAuth,createReliefAssignmentsForAbsenceHandler);
reliefAssignmentRouter.post("/:id/assign",userAuth,assignReliefTeacher);
reliefAssignmentRouter.get("/",userAuth,getReliefAssignments);
reliefAssignmentRouter.get("/available",userAuth,getAvailableReliefTeachers);

export default reliefAssignmentRouter;






