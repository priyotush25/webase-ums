import getFirebaseAuth, { FirebaseConfigError } from "../utils/firebaseAdmin.js";

// Verifies the Firebase ID token sent as "Authorization: Bearer <token>"
// and exposes the decoded claims as req.firebaseUser ({ uid, email, name, ... }).
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

        req.firebaseUser = await getFirebaseAuth().verifyIdToken(idToken);

        next();
    } catch (error) {
        console.error("Firebase token error:", error.message);

        // A broken server configuration is not the client's fault
        if (error instanceof FirebaseConfigError) {
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
