import express from "express";

import {
    getAllResults,
    getCourseResults,
    getMyResults,
    publishCourseResults,
    saveCourseResults,
} from "../controllers/resultController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { requireAdmission } from "../middleware/requireAdmission.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

// Students need an approved admission for everything below
router.use(requireAdmission);

// Student
router.get("/my", authorizeRole("student"), getMyResults);

// Teacher
router.get("/course/:courseId", authorizeRole("teacher"), getCourseResults);
router.post("/course/:courseId", authorizeRole("teacher"), saveCourseResults);
router.post("/course/:courseId/publish", authorizeRole("teacher"), publishCourseResults);

// Admin
router.get("/", authorizeRole("admin"), getAllResults);

export default router;
