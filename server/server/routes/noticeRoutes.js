import express from "express";

import {
    createNotice,
    deleteNotice,
    getNotices,
    updateNotice,
} from "../controllers/noticeController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", authorizeRole("admin", "teacher", "student"), getNotices);

router.post("/", authorizeRole("admin"), createNotice);
router.patch("/:noticeId", authorizeRole("admin"), updateNotice);
router.delete("/:noticeId", authorizeRole("admin"), deleteNotice);

export default router;
