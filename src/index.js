// ----------------------------Third-party libraries & modules----------------------------
import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js";

// Global instances
const app = express();
const PORT = process.env.PORT || 3301;
connectDB();

// Common middleware
app.use(cors({credentials:true}));
app.use(express.json());
app.use(cookieParser());

// Base route / API Endpoints
app.get("/", (req, res) => {
  res.status(200).json({ success: { message: `Welcome to the server!` } });
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Error route
app.use((req, res) => {
  res.status(404).json({ error: { message: `Not found!` } });
});

// Initialize the connection
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});