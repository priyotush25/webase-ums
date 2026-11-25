import express from "express";

import { getSummary } from "../controllers/reportController.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT, authorizeRole("admin"));

router.get("/summary", getSummary);

export default router;
