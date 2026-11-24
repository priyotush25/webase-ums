
import { verifyFirebaseIdToken } from "../utils/verifyFirebaseIdToken.js";

const verifyFirebaseToken = async (req, res, next) => {
    try {
        // ========================================
        // 1. Get Authorization Header
        // ========================================

        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Firebase authentication token is required."
            });
        }

        // ========================================
        // 2. Extract Firebase ID Token
        // ========================================

        const idToken = authHeader.slice(7).trim();

        if (!idToken) {
            return res.status(401).json({
                success: false,
                message: "Firebase authentication token is missing."
            });
        }

        // ========================================
        // 3. Verify Firebase ID Token
        // ========================================

        const firebaseUser = await verifyFirebaseIdToken(idToken);

        if (!firebaseUser?.uid) {
            return res.status(401).json({
                success: false,
                message: "Invalid Firebase user information."
            });
        }

        // ========================================
        // 4. Attach Firebase User Information
        // ========================================

        req.firebaseUser = firebaseUser;

        // ========================================
        // 5. Continue to Next Middleware / Controller
        // ========================================

        return next();

    } catch (error) {
        console.error(
            "Firebase Authentication Error:",
            error.message
        );

        // ========================================
        // 6. Server Configuration Error
        // ========================================

        if (
            error.message?.includes("FIREBASE_PROJECT_ID")
        ) {
            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error."
            });
        }

        // ========================================
        // 7. Invalid / Expired Token
        // ========================================

        return res.status(401).json({
            success: false,
            message: "Invalid or expired Firebase ID Token."
        });
    }
};

export default verifyFirebaseToken;
