
import express from "express";

import {
    createDepartment,
    deleteDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
} from "../controllers/departmentController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT, authorizeRole("admin"));

router.post("/", createDepartment);
router.get("/", getAllDepartments);
router.get("/:departmentId", getDepartmentById);
router.patch("/:departmentId", updateDepartment);
router.delete("/:departmentId", deleteDepartment);

export default router;
