import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const attachTagsSchema = z.object({
  tagIds: z.array(z.string().min(1).max(64)).min(1).max(50),
});

export const noteTagParamsSchema = z.object({
  id: z.string().min(1).max(64),
  tagId: z.string().min(1).max(64),
});
