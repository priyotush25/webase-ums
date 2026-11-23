
import express from "express";

import {
    createCourse,
    deleteCourse,
    getAllCourses,
    getCourseById,
    getMyTeachingCourses,
    updateCourse,
} from "../controllers/courseController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

// Teacher: own assigned courses
router.get(
    "/my",
    authorizeRole("teacher"),
    getMyTeachingCourses
);

// All roles can read courses
router.get(
    "/",
    authorizeRole("admin", "student", "teacher"),
    getAllCourses
);

router.get(
    "/:courseId",
    authorizeRole("admin", "student", "teacher"),
    getCourseById
);

// Admin only
router.post(
    "/",
    authorizeRole("admin"),
    createCourse
);

router.patch(
    "/:courseId",
    authorizeRole("admin"),
    updateCourse
);

router.delete(
    "/:courseId",
    authorizeRole("admin"),
    deleteCourse
);

export default router;
