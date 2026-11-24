
import dotenv from "dotenv";
dotenv.config();

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const encodedService = process.env.FIREBASE_SERVICE;

if (!encodedService) {
    throw new Error("FIREBASE_SERVICE is missing from .env");
}

const serviceAccount = JSON.parse(
    Buffer.from(encodedService, "base64").toString("utf8")
);

const firebaseApp =
    getApps().length === 0
        ? initializeApp({
              credential: cert(serviceAccount),
          })
        : getApps()[0];

const adminAuth = getAuth(firebaseApp);

export { adminAuth };

export default firebaseApp;
