import express from "express";

import {
    getMe,
    login,
    logout,
    signup
} from "../controllers/authController.js";

import uploadImage from "../middleware/uploadImage.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// SIGNUP
router.post(
    "/signup",
    verifyFirebaseToken,
    uploadImage.single("image"),
    signup
);

// LOGIN
router.post("/login", verifyFirebaseToken, login);

// GET CURRENT USER
router.get("/me", verifyJWT, getMe);

// LOGOUT
router.post("/logout", logout);

export default router;