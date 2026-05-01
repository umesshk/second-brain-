import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

export async function listTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createTag(userId: string, name: string) {
  const display = name.trim();
  try {
    return await prisma.tag.create({
      data: { userId, name: display },
      select: { id: true, name: true },
    });
  } catch {
    const existing = await prisma.tag.findFirst({
      where: { userId, name: display },
      select: { id: true, name: true },
    });
    if (existing) return existing;
    throw new HttpError(409, "Tag already exists");
  }
}

export async function attachTagsToNote(userId: string, noteId: string, tagIds: string[]) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds }, userId },
    select: { id: true },
  });
  if (tags.length !== tagIds.length) {
    throw new HttpError(400, "One or more tags are invalid");
  }

  await prisma.noteTag.createMany({
    data: tagIds.map((tagId) => ({ noteId, tagId })),
    skipDuplicates: true,
  });

  return { attached: tagIds.length };
}

export async function detachTagFromNote(userId: string, noteId: string, tagId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) {
    throw new HttpError(404, "Note not found");
  }

  await prisma.noteTag.deleteMany({ where: { noteId, tagId } });
  return { detached: true };
}
