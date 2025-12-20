import express from "express";
import userAuth from "../middleware/userAuth.js";
import { markTeacherAbsent } from "../controllers/absenceController.js";

const absenceRouter = express.Router();

absenceRouter.post("/mark-absent", userAuth, markTeacherAbsent);

export default absenceRouter;