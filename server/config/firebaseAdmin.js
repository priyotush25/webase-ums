
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import serviceAccount from "../serviceAccountKey.json" with {
    type: "json"
};

// Initialize Firebase Admin
const firebaseApp =
    getApps().length === 0
        ? initializeApp({
              credential: cert(serviceAccount),
          })
        : getApps()[0];

// Firebase Admin Authentication
const adminAuth = getAuth(firebaseApp);

export { adminAuth };

export default firebaseApp;
