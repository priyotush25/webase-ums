
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./config/db.js";

// Routes
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// Environment Variables
dotenv.config();

// ========================================
// EXPRESS APP INITIALIZATION
// ========================================

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

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
