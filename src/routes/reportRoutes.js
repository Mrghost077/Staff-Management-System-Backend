import express from "express";
import {
    getAttendanceStats,
    getLeaveStats,
    getReliefStats
} from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/attendance", getAttendanceStats);
reportRouter.get("/leave", getLeaveStats);
reportRouter.get("/relief", getReliefStats);

export default reportRouter;
