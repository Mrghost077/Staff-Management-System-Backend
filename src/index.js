import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import absenceRouter from "./routes/absenceRoutes.js";
import reliefAssignmentRouter from "./routes/reliefAssignmentRoutes.js";
import announcementRoutes from "./routes/announcements.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import leaveRouter from "./routes/leaveRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import teacherRouter  from "./routes/teacherRoutes.js";
import adminDashboardRouter from "./routes/adminDashboardRoutes.js";
import reportRouter from "./routes/reportRoutes.js";

const app = express();
const PORT = process.env.PORT || 3301;

connectDB();

/* Middleware */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

/* Routes */
app.get("/", (req, res) => {
  res.json({ message: "Server running" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/absence", absenceRouter);
app.use("/api/relief-assignments", reliefAssignmentRouter);
app.use("/api/announcements", announcementRoutes);
app.use("/api/timetable", timetableRoutes);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/admin', adminRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/admin-dashboard', adminDashboardRouter);
app.use('/api/reports', reportRouter);


/* Test */
app.get("/api/test", (req, res) => {
  res.send("API WORKING");
});

/* 404 */
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
