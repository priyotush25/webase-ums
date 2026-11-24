import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICES);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
