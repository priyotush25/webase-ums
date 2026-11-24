import express from "express";

import {
    createAssignment,
    deleteAssignment,
    getAllAssignments,
    getMyAssignments,
    getStudentAssignments,
    updateAssignment,
} from "../controllers/assignmentController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

// Student
router.get("/student", authorizeRole("student"), getStudentAssignments);

// Teacher
router.get("/my", authorizeRole("teacher"), getMyAssignments);
router.post("/", authorizeRole("teacher"), createAssignment);
router.patch("/:assignmentId", authorizeRole("teacher"), updateAssignment);
router.delete("/:assignmentId", authorizeRole("teacher"), deleteAssignment);

// Admin
router.get("/", authorizeRole("admin"), getAllAssignments);

export default router;
