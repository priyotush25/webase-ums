import { verifyFirebaseIdToken } from "../utils/verifyFirebaseIdToken.js";

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Firebase ID Token is required",
            });
        }

        const idToken = authHeader.split(" ")[1];

        req.firebaseUser = await verifyFirebaseIdToken(idToken);

        next();

    } catch (error) {
        console.error("Firebase token error:", error.message);

        // A missing project id is a server problem, not a bad token
        if (error.message.includes("FIREBASE_PROJECT_ID")) {
            return res.status(500).json({
                success: false,
                message: "Server is not configured for authentication",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or expired Firebase ID Token",
        });
    }
};

export default verifyFirebaseToken;
