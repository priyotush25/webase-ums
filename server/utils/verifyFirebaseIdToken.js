
import {
    cert,
    getApps,
    initializeApp
} from "firebase-admin/app";

import {
    getAuth
} from "firebase-admin/auth";

// ========================================
// 1. Initialize Firebase Admin
// ========================================

const initializeFirebaseAdmin = () => {
    // Reuse existing Firebase Admin App
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const projectId =
        process.env.FIREBASE_PROJECT_ID?.trim();

    if (!projectId) {
        throw new Error(
            "FIREBASE_PROJECT_ID is not configured."
        );
    }

    // Firebase Service Account JSON
    const serviceAccountJSON =
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJSON) {
        throw new Error(
            "FIREBASE_SERVICE_ACCOUNT_JSON is not configured."
        );
    }

    let serviceAccount;

    try {
        serviceAccount = JSON.parse(serviceAccountJSON);
    } catch {
        throw new Error(
            "Invalid Firebase Service Account JSON."
        );
    }

    // Ensure correct Firebase project
    if (serviceAccount.project_id !== projectId) {
        throw new Error(
            "Firebase Service Account project ID mismatch."
        );
    }

    return initializeApp({
        credential: cert(serviceAccount),
        projectId
    });
};

// ========================================
// 2. Verify Firebase ID Token
// ========================================

export const verifyFirebaseIdToken = async (
    token,
    options = {}
) => {
    try {
        // Check token format
        if (
            typeof token !== "string" ||
            !token.trim()
        ) {
            throw new Error("Invalid Firebase ID Token.");
        }

        const app = initializeFirebaseAdmin();

        // Verify token and optionally check revocation
        const checkRevoked =
            options.checkRevoked ?? true;

        const decodedToken = await getAuth(app).verifyIdToken(
            token.trim(),
            checkRevoked
        );

        // Validate Firebase UID
        if (
            typeof decodedToken.uid !== "string" ||
            !decodedToken.uid
        ) {
            throw new Error("Invalid Firebase UID.");
        }

        // Return verified Firebase user information
        return decodedToken;

    } catch (error) {
        console.error(
            "Firebase ID Token Verification Failed:",
            error.message
        );

        // Preserve server configuration errors
        if (
            error.message?.includes("FIREBASE_PROJECT_ID") ||
            error.message?.includes("FIREBASE_SERVICE_ACCOUNT_JSON") ||
            error.message?.includes("Firebase Service Account")
        ) {
            throw error;
        }

        throw new Error(
            "Invalid or expired Firebase ID Token."
        );
    }
};

export default verifyFirebaseIdToken;
