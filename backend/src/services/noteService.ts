import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { publicNote } from "../utils/serialize";

const noteInclude = {
  noteTags: { include: { tag: true } },
} satisfies Prisma.NoteInclude;

async function assertTagsOwnedByUser(userId: string, tagIds: string[]) {
  if (tagIds.length === 0) return;
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds }, userId },
    select: { id: true },
  });
  if (tags.length !== tagIds.length) {
    throw new HttpError(400, "One or more tags are invalid");
  }
}

export async function listNotes(
  userId: string,
  params: { page: number; limit: number; q?: string; tagIds: string[] }
) {
  const skip = (params.page - 1) * params.limit;
  const where: Prisma.NoteWhereInput = { userId };

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  if (params.tagIds.length > 0) {
    where.noteTags = {
      some: { tagId: { in: params.tagIds } },
    };
  }

  const [total, rows] = await prisma.$transaction([
    prisma.note.count({ where }),
    prisma.note.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.limit,
      include: noteInclude,
    }),
  ]);

  return {
    items: rows.map((n) => publicNote(n)),
    total,
    page: params.page,
    limit: params.limit,
    hasMore: skip + rows.length < total,
  };
}

export async function getNoteById(userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    include: noteInclude,
  });
  if (!note) {
    throw new HttpError(404, "Note not found");
  }
  return publicNote(note);
}

export async function createNote(
  userId: string,
  input: { title: string; content: string; tagIds: string[] }
) {
  await assertTagsOwnedByUser(userId, input.tagIds);

  const note = await prisma.note.create({
    data: {
      title: input.title,
      content: input.content,
      userId,
      ...(input.tagIds.length > 0
        ? {
            noteTags: {
              createMany: {
                data: input.tagIds.map((tagId) => ({ tagId })),
                skipDuplicates: true,
              },
            },
          }
        : {}),
    },
    include: noteInclude,
  });

  return publicNote(note);
}

export async function updateNote(
  userId: string,
  noteId: string,
  input: { title?: string; content?: string; tagIds?: string[] }
) {
  const existing = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!existing) {
    throw new HttpError(404, "Note not found");
  }

  if (input.tagIds) {
    await assertTagsOwnedByUser(userId, input.tagIds);
  }

  await prisma.$transaction(async (tx) => {
    await tx.note.update({
      where: { id: noteId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
      },
    });

    if (input.tagIds) {
      await tx.noteTag.deleteMany({ where: { noteId } });
      if (input.tagIds.length > 0) {
        await tx.noteTag.createMany({
          data: input.tagIds.map((tagId) => ({ noteId, tagId })),
          skipDuplicates: true,
        });
      }
    }
  });

  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    include: noteInclude,
  });
  if (!note) {
    throw new HttpError(404, "Note not found");
  }
  return publicNote(note);
}

export async function deleteNote(userId: string, noteId: string) {
  const res = await prisma.note.deleteMany({ where: { id: noteId, userId } });
  if (res.count === 0) {
    throw new HttpError(404, "Note not found");
  }
  return { deleted: true };
}
