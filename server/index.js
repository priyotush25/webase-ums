
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./config/db.js";

// Routes
import assignmentRoutes from "./routes/assignmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.disable("x-powered-by");

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
// DATABASE CONNECTION MIDDLEWARE
// ========================================

app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database Connection Error:", error);
        next(error);
    }
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

// ========================================
// NOT FOUND
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

    if (res.headersSent) {
        return next(error);
    }

    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
});

// ========================================
// LOCAL DEVELOPMENT ONLY
// ========================================

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// ========================================
// VERCEL SERVERLESS EXPORT
// ========================================

export default app;
