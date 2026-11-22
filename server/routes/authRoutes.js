
import express from "express";

import { signup } from "../controllers/authController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

// Signup Route
router.post("/signup", verifyFirebaseToken, signup);

export default router;
