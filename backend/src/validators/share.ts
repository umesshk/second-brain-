import { z } from "zod";

export const revokeShareSchema = z.object({
  token: z.string().trim().min(10).max(200),
});

export const shareTokenParamSchema = z.object({
  token: z.string().trim().min(10).max(200),
});

export const publicShareQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().max(200).optional(),
});
