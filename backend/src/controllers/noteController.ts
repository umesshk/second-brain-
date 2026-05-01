import type { Request, Response } from "express";
import {
  createNote,
  deleteNote,
  getNoteById,
  listNotes,
  updateNote,
} from "../services/noteService";
import {
  createNoteSchema,
  listNotesQuerySchema,
  noteIdParamSchema,
  updateNoteSchema,
} from "../validators/notes";

export async function listNotesHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const query = listNotesQuerySchema.parse(req.query);
  const tagIds = Array.isArray(query.tagIds) ? query.tagIds : [];
  const result = await listNotes(userId, {
    page: query.page,
    limit: query.limit,
    q: query.q,
    tagIds,
  });
  res.json({ ok: true, ...result });
}

export async function getNoteHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { id } = noteIdParamSchema.parse(req.params);
  const note = await getNoteById(userId, id);
  res.json({ ok: true, note });
}

export async function createNoteHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const body = createNoteSchema.parse(req.body);
  const note = await createNote(userId, {
    title: body.title,
    content: body.content ?? "",
    tagIds: body.tagIds ?? [],
  });
  res.status(201).json({ ok: true, note });
}

export async function updateNoteHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { id } = noteIdParamSchema.parse(req.params);
  const body = updateNoteSchema.parse(req.body);
  const note = await updateNote(userId, id, body);
  res.json({ ok: true, note });
}

export async function deleteNoteHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { id } = noteIdParamSchema.parse(req.params);
  const result = await deleteNote(userId, id);
  res.json({ ok: true, ...result });
}
