
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./config/db.js";
import { backfillUniversityIds } from "./models/User.js";

// Routes
import admissionRoutes from "./routes/admissionRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// Environment Variables
dotenv.config();

// ========================================
// EXPRESS APP INITIALIZATION
// ========================================

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "UMS Server is running successfully",
    });
});

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/enrollments", enrollmentRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/notices", noticeRoutes);

app.use("/api/assignments", assignmentRoutes);

app.use("/api/results", resultRoutes);

app.use("/api/routines", routineRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/fees", feeRoutes);

app.use("/api/public", publicRoutes);

app.use("/api/admissions", admissionRoutes);

app.use("/api/reports", reportRoutes);

// ========================================
// NOT FOUND ROUTE
// ========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {
    console.error("Server Error:", error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
});

// ========================================
// SERVER START
// ========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        const filled = await backfillUniversityIds();
        if (filled) console.log(`Assigned university IDs to ${filled} existing users`);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server Startup Error:", error);
        process.exit(1);
    }
};

startServer();

export default app;
