import express from "express";

import {
    createEvent,
    deleteEvent,
    getEvents,
    updateEvent,
} from "../controllers/eventController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", authorizeRole("admin", "teacher", "student"), getEvents);

router.post("/", authorizeRole("admin"), createEvent);
router.patch("/:eventId", authorizeRole("admin"), updateEvent);
router.delete("/:eventId", authorizeRole("admin"), deleteEvent);

export default router;
