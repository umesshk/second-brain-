import { api } from "./client";
import type { ApiTag } from "./types";

export async function listTags() {
  const { data } = await api.get<{ ok: true; tags: ApiTag[] }>("/api/v1/tags");
  return data.tags;
}

export async function createTag(name: string) {
  const { data } = await api.post<{ ok: true; tag: ApiTag }>("/api/v1/tags", { name });
  return data.tag;
}
