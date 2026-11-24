import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!process.env.FIREBASE_SERVICES) {
  throw new Error("FIREBASE_SERVICES env variable is missing");
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICES);

if (!serviceAccount.private_key || !serviceAccount.client_email) {
  throw new Error("FIREBASE_SERVICES is not a valid service account JSON");
}

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(serviceAccount) });

export const adminAuth = getAuth(app);
