import express from "express";

import {
    getApplications,
    getMyApplication,
    reviewApplication,
    submitApplication,
    trackApplication,
} from "../controllers/admissionController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import rateLimit from "../middleware/rateLimit.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// Student: apply from the dashboard (needs an account)
router.post(
    "/apply",
    verifyJWT,
    authorizeRole("student"),
    rateLimit({ windowMs: 60 * 60 * 1000, max: 8, message: "Too many applications. Try again later." }),
    submitApplication
);

router.get("/my", verifyJWT, authorizeRole("student"), getMyApplication);

// Public

router.get(
    "/track",
    rateLimit({ windowMs: 10 * 60 * 1000, max: 30 }),
    trackApplication
);

// Admin
router.get("/", verifyJWT, authorizeRole("admin"), getApplications);
router.patch("/:applicationId", verifyJWT, authorizeRole("admin"), reviewApplication);

export default router;
