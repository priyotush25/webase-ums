
import express from "express";

import {
    createEnrollment,
    deleteEnrollment,
    getAllEnrollments,
    getMyEnrollments,
    getMyTeachingStudents,
    updateEnrollmentStatus,
} from "../controllers/enrollmentController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { requireAdmission } from "../middleware/requireAdmission.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Students need an approved admission for everything below
router.use(requireAdmission);

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
// TEACHER ROUTES
// ========================================

router.get(
    "/teacher/students",
    authorizeRole("teacher"),
    getMyTeachingStudents
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
