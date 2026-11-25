
import express from "express";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

import {
    getAllAttendance,
    getCourseAttendance,
    getCourseStudentsForAttendance,
    getMyAttendance,
    saveCourseAttendance
} from "../controllers/attendanceController.js";

const router = express.Router();

router.use(verifyJWT);

// Student
router.get(
    "/my",
    authorizeRole("student"),
    getMyAttendance
);

// Teacher
router.get(
    "/course/:courseId/students",
    authorizeRole("teacher"),
    getCourseStudentsForAttendance
);

router.get(
    "/course/:courseId",
    authorizeRole("teacher"),
    getCourseAttendance
);

router.post(
    "/course/:courseId",
    authorizeRole("teacher"),
    saveCourseAttendance
);

// Admin
router.get(
    "/",
    authorizeRole("admin"),
    getAllAttendance
);

export default router;
