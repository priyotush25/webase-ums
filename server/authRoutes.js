import express from "express";
import {
    getMe,
    login,
    logout,
    logoutAll,
    signup
} from "../controllers/authController.js";

import { getMyProfile, updateMyProfile } from "../controllers/profileController.js";
import uploadImage from "../middleware/uploadImage.js";
import rateLimit from "../middleware/rateLimit.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// Brute-force protection for credential endpoints (per IP)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: "Too many attempts. Please try again in a few minutes.",
});

// SIGNUP
router.post(
    "/signup",
    authLimiter,
    verifyFirebaseToken,
    uploadImage.single("image"),
    signup
);

// LOGIN
router.post("/login", authLimiter, verifyFirebaseToken, login);

// GET CURRENT USER
router.get("/me", verifyJWT, getMe);

// LOGOUT
router.post("/logout", logout);
router.post("/logout-all", verifyJWT, logoutAll);

// Profile
router.get("/profile", verifyJWT, getMyProfile);

router.put(
    "/profile",
    verifyJWT,
    uploadImage.single("image"),
    updateMyProfile
);







export default router;