import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import * as tagController from "../controllers/tagController";

const router = Router();

router.use(authMiddleware);

router.get("/tags", asyncHandler(tagController.listTagsHandler));
router.post("/tags", asyncHandler(tagController.createTagHandler));
router.post("/notes/:id/tags", asyncHandler(tagController.attachTagsHandler));
router.delete("/notes/:id/tags/:tagId", asyncHandler(tagController.detachTagHandler));

export default router;
