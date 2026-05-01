import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as shareController from "../controllers/shareController";

const router = Router();

router.get("/public/share/:token", asyncHandler(shareController.publicShareHandler));

export default router;
