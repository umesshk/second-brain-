import { api } from "./client";
import type { ApiNote, PaginatedNotes } from "./types";

export async function listNotes(params: {
  page?: number;
  limit?: number;
  q?: string;
  tagIds?: string[];
}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.tagIds?.length) search.set("tagIds", params.tagIds.join(","));
  const { data } = await api.get<PaginatedNotes>(`/api/v1/notes?${search.toString()}`);
  return data;
}

export async function getNote(id: string) {
  const { data } = await api.get<{ ok: true; note: ApiNote }>(`/api/v1/notes/${id}`);
  return data.note;
}

export async function createNote(input: { title: string; content: string; tagIds?: string[] }) {
  const { data } = await api.post<{ ok: true; note: ApiNote }>("/api/v1/notes", input);
  return data.note;
}

export async function updateNote(
  id: string,
  input: { title?: string; content?: string; tagIds?: string[] }
) {
  const { data } = await api.patch<{ ok: true; note: ApiNote }>(`/api/v1/notes/${id}`, input);
  return data.note;
}

export async function deleteNote(id: string) {
  await api.delete(`/api/v1/notes/${id}`);
}
