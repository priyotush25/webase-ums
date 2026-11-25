
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
import eventRoutes from "./routes/eventRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",

    // Production frontend
    ...(process.env.CLIENT_URL || "")
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean),
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.error("Blocked CORS Origin:", origin);

            return callback(new Error("Origin not allowed by CORS"));
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],

        credentials: true,

        optionsSuccessStatus: 204,
    })
);

// ========================================
// BODY PARSER
// ========================================

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========================================
// DATABASE CONNECTION
// ========================================

let initPromise = null;

const init = () => {
    if (!initPromise) {
        initPromise = (async () => {
            await connectDB();

            const filled = await backfillUniversityIds();

            if (filled) {
                console.log(
                    `Assigned university IDs to ${filled} existing users`
                );
            }
        })().catch((error) => {
            initPromise = null;
            throw error;
        });
    }

    return initPromise;
};

// ========================================
// DATABASE MIDDLEWARE
// ========================================

app.use(async (req, res, next) => {
    try {
        await init();
        next();
    } catch (error) {
        console.error("Database Error:", error);

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

    // Upload problems (file too large, wrong type) are client errors
    if (error.name === "MulterError") {
        return res.status(400).json({
            success: false,
            message:
                error.code === "LIMIT_FILE_SIZE"
                    ? "Image size must be less than 5 MB."
                    : error.message,
        });
    }

    if (error.message === "Only JPG, PNG and WEBP images are allowed.") {
        return res.status(400).json({ success: false, message: error.message });
    }

    if (error.message === "Origin not allowed by CORS") {
        return res.status(403).json({ success: false, message: error.message });
    }

    res.status(error.status || 500).json({
        success: false,
        message: error.status ? error.message : "Internal Server Error",
    });
});

// ========================================
// SERVER START
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
