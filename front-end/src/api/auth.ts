import { api } from "./client";
import type { ApiUser } from "./types";

export async function signup(input: { name: string; email: string; password: string }) {
  const { data } = await api.post<{ ok: true; user: ApiUser; message: string }>("/user/api/v1/signup", input);
  return data.user;
}

export async function signin(input: { email: string; password: string }) {
  const { data } = await api.post<{ ok: true; user: ApiUser; message: string }>("/user/api/v1/signin", input);
  return data.user;
}

export async function logout() {
  await api.post("/user/api/v1/logout", {});
}
