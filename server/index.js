import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import firebaseApp from "./config/firebaseAdmin.js";

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "UMS Backend Server is Running!",
    });
});


// test route to verify Firebase Admin SDK
app.get("/api/test-firebase", (req, res) => {

    const projectId = firebaseApp.options.projectId;

    res.status(200).json({
        success: true,
        message: "Firebase Admin SDK Connected Successfully",
        projectId,
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
