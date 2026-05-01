import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/api/v1/signup", asyncHandler(authController.signup));
router.post("/api/v1/signin", asyncHandler(authController.signin));
router.post("/api/v1/logout", asyncHandler(authController.logout));

export default router;
