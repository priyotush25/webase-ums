
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import firebaseApp from "./config/firebaseAdmin.js";
import verifyFirebaseToken from "./middleware/verifyFirebaseToken.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);


app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);


// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "UMS Backend Server is Running!",
    });
});

// Test Firebase Admin SDK
app.get("/api/test-firebase", (req, res) => {
    const projectId = firebaseApp.options.projectId;

    res.status(200).json({
        success: true,
        message: "Firebase Admin SDK Connected Successfully",
        projectId,
    });
});

// Test Firebase Token
app.get("/api/auth/check", verifyFirebaseToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Firebase Token Verified Successfully",
        user: {
            uid: req.firebaseUser.uid,
            email: req.firebaseUser.email,
            name: req.firebaseUser.name,
        },
    });
});

// Start Server
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server Startup Failed:", error.message);
    }
};

startServer();
