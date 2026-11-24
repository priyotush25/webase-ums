
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

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

// Local convenience: take the project id from an old serviceAccountKey.json if present
if (!process.env.FIREBASE_PROJECT_ID?.trim()) {
    try {
        const keyFile = fileURLToPath(new URL("./serviceAccountKey.json", import.meta.url));
        process.env.FIREBASE_PROJECT_ID = JSON.parse(fs.readFileSync(keyFile, "utf8")).project_id || "";
    } catch {
        // no key file - the variable must be set in .env
    }
}

// Fail early with a clear message instead of obscure 500 errors later
const requiredEnv = ["MONGODB_URI", "JWT_SECRET", "FIREBASE_PROJECT_ID"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());

if (missingEnv.length) {
    console.error(
        `\n[config] Missing required environment variables: ${missingEnv.join(", ")}\n` +
        `[config] Copy server/.env.example to server/.env and fill them in.\n`
    );
}

if (!process.env.IMGBB_API_KEY?.trim()) {
    console.warn("[config] IMGBB_API_KEY is not set - profile photos will not be uploaded.");
}

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
        if (missingEnv.length) {
            throw new Error(`Missing environment variables: ${missingEnv.join(", ")}`);
        }

        await init();
        next();
    } catch (error) {
        console.error("Database Error:", error);

        res.status(503).json({
            success: false,
            message: missingEnv.length
                ? `Server is not configured (missing: ${missingEnv.join(", ")}).`
                : "Service unavailable. Database connection failed.",
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

    // Upload problems (wrong type, too large) are the client's fault
    const status = error.name === "MulterError" ? 400 : error.status || 500;

    res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
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
