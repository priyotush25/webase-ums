import express from "express";

import {
    createFee,
    deleteFee,
    getAllFees,
    getMyFees,
    markFeePaid,
} from "../controllers/feeController.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/my", authorizeRole("student"), getMyFees);

router.get("/", authorizeRole("admin"), getAllFees);
router.post("/", authorizeRole("admin"), createFee);
router.patch("/:feeId/pay", authorizeRole("admin"), markFeePaid);
router.delete("/:feeId", authorizeRole("admin"), deleteFee);

export default router;
