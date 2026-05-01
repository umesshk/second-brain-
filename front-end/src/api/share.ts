import { api } from "./client";
import type { ApiNote } from "./types";

export type ShareLink = { id: string; token: string; createdAt: string };

export type PublicShareResponse = {
  ok: true;
  owner: { name: string };
  items: ApiNote[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export async function createShareLink() {
  const { data } = await api.post<{ ok: true; share: ShareLink }>("/api/v1/share", {});
  return data.share;
}

export async function listShareLinks() {
  const { data } = await api.get<{ ok: true; links: ShareLink[] }>("/api/v1/share");
  return data.links;
}

export async function revokeShareLink(token: string) {
  await api.delete("/api/v1/share", { data: { token } });
}

export async function getPublicSharedNotes(token: string, params?: { page?: number; limit?: number; q?: string }) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.q?.trim()) search.set("q", params.q.trim());
  const qs = search.toString();
  const { data } = await api.get<PublicShareResponse>(
    `/api/v1/public/share/${encodeURIComponent(token)}${qs ? `?${qs}` : ""}`
  );
  return data;
}
