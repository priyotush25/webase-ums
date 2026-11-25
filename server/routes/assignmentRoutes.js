import express from "express";

import {
    createAssignment,
    deleteAssignment,
    getAllAssignments,
    getAssignmentSubmissions,
    markSubmission,
    getMyAssignments,
    getStudentAssignments,
    submitAssignment,
    updateAssignment,
} from "../controllers/assignmentController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { requireAdmission } from "../middleware/requireAdmission.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

// Students need an approved admission for everything below
router.use(requireAdmission);

// Student
router.get("/student", authorizeRole("student"), getStudentAssignments);
router.post("/:assignmentId/submit", authorizeRole("student"), submitAssignment);

// Teacher
router.get("/my", authorizeRole("teacher"), getMyAssignments);
router.post("/", authorizeRole("teacher"), createAssignment);
router.get("/:assignmentId/submissions", authorizeRole("teacher"), getAssignmentSubmissions);
router.patch("/submissions/:submissionId", authorizeRole("teacher"), markSubmission);
router.patch("/:assignmentId", authorizeRole("teacher"), updateAssignment);
router.delete("/:assignmentId", authorizeRole("teacher"), deleteAssignment);

// Admin
router.get("/", authorizeRole("admin"), getAllAssignments);

export default router;
