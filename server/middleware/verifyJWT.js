
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyFirebaseIdToken } from "../utils/verifyFirebaseIdToken.js";

export const verifyJWT = async (req, res, next) => {
    try {
        let user = null;
        let firebaseUser = null;

        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.ums_token;

        // ========================================
        // 1. Firebase Bearer Token Authentication
        // ========================================

        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.slice(7).trim();

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication token missing."
                });
            }

            // Verify Firebase ID Token
            firebaseUser = await verifyFirebaseIdToken(token);

            // Find MongoDB user using Firebase UID
            user = await User.findOne({
                firebaseUid: firebaseUser.uid
            });
        }

        // ========================================
        // 2. Legacy Custom JWT Cookie Authentication
        // ========================================

        else if (cookieToken) {

            if (!process.env.JWT_SECRET) {
                console.error("JWT_SECRET is not configured.");

                return res.status(500).json({
                    success: false,
                    message: "Server authentication configuration error."
                });
            }

            // Verify Custom JWT
            const decoded = jwt.verify(
                cookieToken,
                process.env.JWT_SECRET
            );

            // Find MongoDB user using MongoDB ID
            user = await User.findById(decoded.id);
        }

        // ========================================
        // 3. No Token Found
        // ========================================

        else {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing."
            });
        }

        // ========================================
        // 4. Check User
        // ========================================

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again."
            });
        }

        // ========================================
        // 5. Attach User Information
        // ========================================

        req.user = user;

        if (firebaseUser) {
            req.firebaseUser = firebaseUser;
        }

        // ========================================
        // 6. Continue
        // ========================================

        return next();

    } catch (error) {

        console.error(
            "Authentication Verification Error:",
            error.message
        );

        // Firebase configuration error
        if (
            error.message?.includes("FIREBASE_PROJECT_ID") ||
            error.message?.includes("JWT_SECRET")
        ) {
            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error."
            });
        }

        // Invalid or expired token
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });
    }
};
