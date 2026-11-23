import express from "express";

import {
    getAllUsers,
    getUserById,
    getUserStats,
    updateUserRole
} from "../controllers/userController.js";

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

export default router;