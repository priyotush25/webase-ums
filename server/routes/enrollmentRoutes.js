
import express from "express";

import {
    createEnrollment,
    deleteEnrollment,
    getAllEnrollments,
    getMyEnrollments,
    updateEnrollmentStatus,
} from "../controllers/enrollmentController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// ========================================
// STUDENT ROUTES
// ========================================

router.post(
    "/",
    authorizeRole("student"),
    createEnrollment
);

router.get(
    "/my",
    authorizeRole("student"),
    getMyEnrollments
);

// ========================================
// ADMIN ROUTES
// ========================================

router.get(
    "/",
    authorizeRole("admin"),
    getAllEnrollments
);

router.patch(
    "/:enrollmentId/status",
    authorizeRole("admin"),
    updateEnrollmentStatus
);

router.delete(
    "/:enrollmentId",
    authorizeRole("admin"),
    deleteEnrollment
);

export default router;
