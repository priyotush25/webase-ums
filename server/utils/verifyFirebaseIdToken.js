
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

    // Get Base64 encoded Service Account JSON
    const encodedServiceAccount =
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();

    if (!encodedServiceAccount) {
        throw new Error(
            "FIREBASE_SERVICE_ACCOUNT_JSON is not configured."
        );
    }

    let serviceAccount;

    try {
        // Decode Base64 to JSON string
        const decodedJSON = Buffer
            .from(encodedServiceAccount, "base64")
            .toString("utf8");

        // Parse JSON
        serviceAccount = JSON.parse(decodedJSON);

    } catch (error) {
        throw new Error(
            "Invalid Base64 Firebase Service Account JSON."
        );
    }

    // Check required Service Account fields
    if (
        !serviceAccount.project_id ||
        !serviceAccount.client_email ||
        !serviceAccount.private_key
    ) {
        throw new Error(
            "Firebase Service Account credentials are incomplete."
        );
    }

    // Ensure correct Firebase project
    if (serviceAccount.project_id !== projectId) {
        throw new Error(
            "Firebase Service Account project ID mismatch."
        );
    }

    // Initialize Firebase Admin
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
        if (
            typeof token !== "string" ||
            !token.trim()
        ) {
            throw new Error("Invalid Firebase ID Token.");
        }

        const app = initializeFirebaseAdmin();

        // Check token revocation by default
        const checkRevoked =
            options.checkRevoked ?? true;

        const decodedToken = await getAuth(app).verifyIdToken(
            token.trim(),
            checkRevoked
        );

        if (
            typeof decodedToken.uid !== "string" ||
            !decodedToken.uid
        ) {
            throw new Error("Invalid Firebase UID.");
        }

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
            error.message?.includes("Firebase Service Account") ||
            error.message?.includes("Invalid Base64")
        ) {
            throw error;
        }

        throw new Error(
            "Invalid or expired Firebase ID Token."
        );
    }
};

export default verifyFirebaseIdToken;
