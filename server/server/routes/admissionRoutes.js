import express from "express";

import {
    getApplications,
    reviewApplication,
    submitApplication,
    trackApplication,
} from "../controllers/admissionController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import rateLimit from "../middleware/rateLimit.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// Public
router.post(
    "/apply",
    rateLimit({ windowMs: 60 * 60 * 1000, max: 8, message: "Too many applications from this network. Try again later." }),
    submitApplication
);

router.get(
    "/track",
    rateLimit({ windowMs: 10 * 60 * 1000, max: 30 }),
    trackApplication
);

// Admin
router.get("/", verifyJWT, authorizeRole("admin"), getApplications);
router.patch("/:applicationId", verifyJWT, authorizeRole("admin"), reviewApplication);

export default router;
