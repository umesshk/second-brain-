import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isHttpError } from "../utils/httpError";
import { Prisma } from "@prisma/client";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (isHttpError(err)) {
    res.status(err.status).json({
      ok: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: {
        message: "Validation failed",
        issues: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        ok: false,
        error: { message: "A record with this value already exists", code: err.code },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        ok: false,
        error: { message: "Record not found", code: err.code },
      });
      return;
    }
  }

  console.error(err);
  res.status(500).json({
    ok: false,
    error: { message: "Internal server error" },
  });
}
