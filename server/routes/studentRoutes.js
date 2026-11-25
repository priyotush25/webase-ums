import express from "express";

import { getMyOverview } from "../controllers/studentController.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT, authorizeRole("student"));

// Works before admission too: it tells the dashboard which mode to show
router.get("/overview", getMyOverview);

export default router;
