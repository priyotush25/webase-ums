import { adminAuth } from "../config/firebaseAdmin.js";

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

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    req.firebaseUser = decodedToken;

    next();
  } catch (error) {
    console.error(error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase ID Token",
    });
  }
};

export default verifyFirebaseToken;
