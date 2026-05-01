import type { User } from "@prisma/client";

export function publicUser(user: Pick<User, "id" | "name" | "email" | "createdAt">) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function publicNote(note: {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  noteTags?: { tag: { id: string; name: string } }[];
}) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    tags: (note.noteTags ?? []).map((nt) => ({ id: nt.tag.id, name: nt.tag.name })),
  };
}
