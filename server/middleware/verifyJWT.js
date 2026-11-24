
import User from "../models/User.js";
import { verifyFirebaseIdToken } from "../utils/verifyFirebaseIdToken.js";

export const verifyJWT = async (req, res, next) => {
    try {
        // 1. Get Firebase ID Token
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing."
            });
        }

        // 2. Extract Token
        const token = authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing."
            });
        }

        // 3. Verify Firebase Token
        const firebaseUser = await verifyFirebaseIdToken(token);

        // 4. Find MongoDB User using Firebase UID
        const user = await User.findOne({
            firebaseUid: firebaseUser.uid
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again."
            });
        }

        // 5. Attach User Information
        req.user = user;
        req.firebaseUser = firebaseUser;

        // 6. Continue to Controller
        return next();

    } catch (error) {
        console.error(
            "Authentication Verification Error:",
            error.message
        );

        if (error.message.includes("FIREBASE_PROJECT_ID")) {
            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or expired Firebase ID Token."
        });
    }
};
