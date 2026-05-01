import { z } from "zod";

const cuidLike = z.string().min(1).max(64);

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(500),
  content: z.string().max(100_000).optional().default(""),
  tagIds: z.array(cuidLike).max(50).optional().default([]),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  content: z.string().max(100_000).optional(),
  tagIds: z.array(cuidLike).max(50).optional(),
});

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().max(200).optional(),
  tagIds: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [])),
});

export const noteIdParamSchema = z.object({
  id: cuidLike,
});
