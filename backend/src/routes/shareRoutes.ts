import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import * as shareController from "../controllers/shareController";

const router = Router();

router.post("/share", authMiddleware, asyncHandler(shareController.createShareHandler));
router.get("/share", authMiddleware, asyncHandler(shareController.listShareHandler));
router.delete("/share", authMiddleware, asyncHandler(shareController.revokeShareHandler));

export default router;
