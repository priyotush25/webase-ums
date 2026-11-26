import express from "express";

import {
    deleteUser,
    getAllUsers,
    getUserById,
    getUserStats,
    updateUserRole,
    updateUserStatus
} from "../controllers/userController.js";

import { updateAcademicRecord } from "../controllers/profileController.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// Admin Authentication
router.use(verifyJWT, authorizeRole("admin"));

// User Management
router.get("/", getAllUsers);

// Dashboard Statistics
router.get("/stats", getUserStats);

// Single User
router.get("/:userId", getUserById);

// Update User Role
router.patch("/:userId/role", updateUserRole);

// Activate / deactivate account
router.patch("/:userId/status", updateUserStatus);

// Update academic record (department, semester, batch, designation)
router.patch("/:userId/academic", updateAcademicRecord);

// Delete user (admin only)
router.delete("/:userId", deleteUser);

export default router;