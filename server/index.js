
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
        // CLIENT_URL can hold several origins separated by commas
        origin: (origin, callback) => {
            const allowed = (process.env.CLIENT_URL || "")
                .split(",")
                .map((item) => item.trim().replace(/\/$/, ""))
                .filter(Boolean);

            // No Origin header = same-origin request or a tool like curl
            if (!origin || allowed.includes(origin)) return callback(null, true);

            return callback(new Error(`Origin not allowed: ${origin}`));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ========================================
// DATABASE (connected once, reused between requests)
// ========================================

let initPromise = null;

const init = () => {
    if (!initPromise) {
        initPromise = (async () => {
            await connectDB();

            const filled = await backfillUniversityIds();
            if (filled) console.log(`Assigned university IDs to ${filled} existing users`);
        })().catch((error) => {
            initPromise = null;
            throw error;
        });
    }

    return initPromise;
};

app.use(async (req, res, next) => {
    try {
        await init();
        next();
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(503).json({
            success: false,
            message: "Service unavailable. Database connection failed.",
        });
    }
});

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
// SERVER START (skipped on Vercel, which calls the exported app directly)
// ========================================

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;

    init()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Server Startup Error:", error);
            process.exit(1);
        });
}

export default app;
