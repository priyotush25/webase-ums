
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

router.use(verifyJWT, authorizeRole("admin"));

router.post("/", createCourse);
router.get("/", getAllCourses);
router.get("/:courseId", getCourseById);
router.patch("/:courseId", updateCourse);
router.delete("/:courseId", deleteCourse);

export default router;
