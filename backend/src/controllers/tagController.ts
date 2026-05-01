import type { Request, Response } from "express";
import { attachTagsToNote, createTag, detachTagFromNote, listTags } from "../services/tagService";
import { attachTagsSchema, createTagSchema, noteTagParamsSchema } from "../validators/tags";
import { noteIdParamSchema } from "../validators/notes";

export async function listTagsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const tags = await listTags(userId);
  res.json({ ok: true, tags });
}

export async function createTagHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const body = createTagSchema.parse(req.body);
  const tag = await createTag(userId, body.name);
  res.status(201).json({ ok: true, tag });
}

export async function attachTagsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { id } = noteIdParamSchema.parse(req.params);
  const body = attachTagsSchema.parse(req.body);
  const result = await attachTagsToNote(userId, id, body.tagIds);
  res.json({ ok: true, ...result });
}

export async function detachTagHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { id, tagId } = noteTagParamsSchema.parse(req.params);
  const result = await detachTagFromNote(userId, id, tagId);
  res.json({ ok: true, ...result });
}
