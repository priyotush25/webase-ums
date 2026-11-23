
import express from "express";

import {
    getAllUsers,
    getUserById,
    updateUserRole
} from "../controllers/userController.js";

import authorizeRole from "../middleware/authorizeRole.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// All routes require Admin authentication
router.use(verifyJWT, authorizeRole("admin"));

// Get all users with search, filter and pagination
router.get("/", getAllUsers);

// Get single user
router.get("/:userId", getUserById);

// Update user role
router.patch("/:userId/role", updateUserRole);

export default router;
