import type { Request, Response } from "express";
import { COOKIE_SECURE, JWT_EXPIRES_IN } from "../config/env";
import { signupUser, signinUser } from "../services/authService";
import { signinSchema, signupSchema } from "../validators/auth";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, token: string) {
  const maxAge = JWT_EXPIRES_IN.endsWith("d")
    ? Number(JWT_EXPIRES_IN.slice(0, -1)) * 24 * 60 * 60 * 1000
    : SEVEN_DAYS_MS;

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: COOKIE_SECURE,
    maxAge,
    path: "/",
  });
}

export async function signup(req: Request, res: Response): Promise<void> {
  const body = signupSchema.parse(req.body);
  const { token, user } = await signupUser(body);
  setAuthCookie(res, token);
  res.status(201).json({ ok: true, user, message: "User signed up" });
}

export async function signin(req: Request, res: Response): Promise<void> {
  const body = signinSchema.parse(req.body);
  const { token, user } = await signinUser(body);
  setAuthCookie(res, token);
  res.status(200).json({ ok: true, user, message: "Signed in" });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("token", { path: "/", httpOnly: true, sameSite: "strict", secure: COOKIE_SECURE });
  res.status(200).json({ ok: true, message: "Logged out" });
}
