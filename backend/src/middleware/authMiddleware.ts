import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { HttpError } from "../utils/httpError";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.token;
    if (!token || typeof token !== "string") {
      throw new HttpError(401, "Not authenticated");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; sub?: string };
    const userId = decoded.id ?? decoded.sub;
    if (!userId) {
      throw new HttpError(401, "Invalid token payload");
    }

    req.userId = userId;
    next();
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status).json({ ok: false, error: { message: e.message, code: e.code } });
      return;
    }
    res.status(401).json({ ok: false, error: { message: "Invalid or expired session" } });
  }
}
