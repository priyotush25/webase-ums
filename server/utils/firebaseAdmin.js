// Firebase Admin SDK, configured from a base64-encoded service account JSON
// stored in the FIREBASE_SERVICE environment variable.
//
// Create the value from the downloaded key file:
//   Linux:  base64 -w 0 serviceAccountKey.json
//   macOS:  base64 -i serviceAccountKey.json | tr -d '\n'
//   Any OS: node -e "console.log(require('fs').readFileSync('serviceAccountKey.json').toString('base64'))"
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export class FirebaseConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = "FirebaseConfigError";
    }
}

const loadServiceAccount = () => {
    const encoded = process.env.FIREBASE_SERVICE?.trim();

    if (!encoded) {
        throw new FirebaseConfigError("FIREBASE_SERVICE is not set on the server");
    }

    let account;

    try {
        account = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
    } catch {
        throw new FirebaseConfigError("FIREBASE_SERVICE is not a valid base64-encoded JSON key");
    }

    if (!account.project_id || !account.client_email || !account.private_key) {
        throw new FirebaseConfigError("FIREBASE_SERVICE is missing project_id, client_email or private_key");
    }

    // Keys pasted through some hosts arrive with literal "\n" sequences
    account.private_key = account.private_key.replace(/\\n/g, "\n");

    return account;
};

// Initialised lazily: dotenv runs after ES module imports are evaluated
export const getFirebaseAuth = () => {
    if (!getApps().length) {
        initializeApp({ credential: cert(loadServiceAccount()) });
    }

    return getAuth();
};

export default getFirebaseAuth;
