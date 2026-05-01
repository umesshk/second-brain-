import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { publicNote } from "../utils/serialize";

const noteInclude = {
  noteTags: { include: { tag: true } },
} satisfies Prisma.NoteInclude;

function newToken(): string {
  return randomBytes(24).toString("hex");
}

export async function createShareLink(userId: string) {
  const token = newToken();
  const link = await prisma.shareLink.create({
    data: { userId, token },
    select: { id: true, token: true, createdAt: true },
  });
  return link;
}

export async function revokeShareLink(userId: string, token: string) {
  const link = await prisma.shareLink.findFirst({
    where: { token, userId },
  });
  if (!link) {
    throw new HttpError(404, "Share link not found");
  }
  if (link.revokedAt) {
    throw new HttpError(410, "Share link already revoked");
  }

  await prisma.shareLink.update({
    where: { id: link.id },
    data: { revokedAt: new Date() },
  });
  return { revoked: true };
}

export async function listMyShareLinks(userId: string) {
  return prisma.shareLink.findMany({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, token: true, createdAt: true },
  });
}

export async function getPublicSharedNotes(
  token: string,
  params: { page: number; limit: number; q?: string }
) {
  const link = await prisma.shareLink.findFirst({
    where: { token },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!link) {
    throw new HttpError(404, "Share link not found");
  }
  if (link.revokedAt) {
    throw new HttpError(410, "Share link revoked");
  }

  const skip = (params.page - 1) * params.limit;
  const where: Prisma.NoteWhereInput = { userId: link.userId };

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
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
    owner: { name: link.user.name },
    items: rows.map((n) => publicNote(n)),
    total,
    page: params.page,
    limit: params.limit,
    hasMore: skip + rows.length < total,
  };
}
