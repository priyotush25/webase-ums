
import express from "express";

import {
    createCourse,
    deleteCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
} from "../controllers/courseController.js";

import authorizeRole from "../middleware/authorizeRole.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// All routes require login
router.use(verifyJWT);

// Student and Admin can view courses
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

// Only Admin can manage courses
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
