import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import * as noteController from "../controllers/noteController";

const router = Router();

router.use(authMiddleware);

router.get("/notes", asyncHandler(noteController.listNotesHandler));
router.post("/notes", asyncHandler(noteController.createNoteHandler));
router.get("/notes/:id", asyncHandler(noteController.getNoteHandler));
router.patch("/notes/:id", asyncHandler(noteController.updateNoteHandler));
router.delete("/notes/:id", asyncHandler(noteController.deleteNoteHandler));

export default router;
