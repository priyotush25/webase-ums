import express from "express";

import {
    createRoutine,
    deleteRoutine,
    getAllRoutines,
    getMyRoutine,
    updateRoutine,
} from "../controllers/routineController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/my", authorizeRole("student", "teacher"), getMyRoutine);

router.get("/", authorizeRole("admin"), getAllRoutines);
router.post("/", authorizeRole("admin"), createRoutine);
router.patch("/:routineId", authorizeRole("admin"), updateRoutine);
router.delete("/:routineId", authorizeRole("admin"), deleteRoutine);

export default router;
