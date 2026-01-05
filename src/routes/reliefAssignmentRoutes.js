import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
    assignReliefTeacher,
    createReliefAssignmentsForAbsenceHandler,
    getAvailableReliefTeachers,
    getReliefAssignments
} from "../controllers/reliefAssignmentController.js";

const reliefAssignmentRouter = express.Router();


reliefAssignmentRouter.post("/relief-assignments/:absenceId/create",userAuth,createReliefAssignmentsForAbsenceHandler);
reliefAssignmentRouter.post("/relief-assignments/:id/assign",userAuth,assignReliefTeacher);
reliefAssignmentRouter.get("/relief-assignments",userAuth,getReliefAssignments);
reliefAssignmentRouter.get("/relief-assignments/available",userAuth,getAvailableReliefTeachers);

export default reliefAssignmentRouter;





