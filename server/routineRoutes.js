import express from "express";

import {
    createRoutine,
    deleteRoutine,
    getAllRoutines,
    getMyRoutine,
    updateRoutine,
} from "../controllers/routineController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { requireAdmission } from "../middleware/requireAdmission.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

// Students need an approved admission for everything below
router.use(requireAdmission);

router.get("/my", authorizeRole("student", "teacher"), getMyRoutine);

router.get("/", authorizeRole("admin"), getAllRoutines);
router.post("/", authorizeRole("admin"), createRoutine);
router.patch("/:routineId", authorizeRole("admin"), updateRoutine);
router.delete("/:routineId", authorizeRole("admin"), deleteRoutine);

export default router;
