import express from "express";

import {
    getAllResults,
    getCourseResults,
    getMyResults,
    saveCourseResults,
} from "../controllers/resultController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

// Student
router.get("/my", authorizeRole("student"), getMyResults);

// Teacher
router.get("/course/:courseId", authorizeRole("teacher"), getCourseResults);
router.post("/course/:courseId", authorizeRole("teacher"), saveCourseResults);

// Admin
router.get("/", authorizeRole("admin"), getAllResults);

export default router;
