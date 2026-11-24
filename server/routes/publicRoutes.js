import express from "express";

import {
    getDepartmentByCode,
    getDepartments,
    getFaculty,
    getOverview,
    getPublicEvents,
    getPublicNotices,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/overview", getOverview);
router.get("/departments", getDepartments);
router.get("/departments/:code", getDepartmentByCode);
router.get("/faculty", getFaculty);
router.get("/notices", getPublicNotices);
router.get("/events", getPublicEvents);

export default router;
