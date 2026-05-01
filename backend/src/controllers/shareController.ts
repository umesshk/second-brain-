import type { Request, Response } from "express";
import {
  createShareLink,
  getPublicSharedNotes,
  listMyShareLinks,
  revokeShareLink,
} from "../services/shareService";
import { publicShareQuerySchema, revokeShareSchema, shareTokenParamSchema } from "../validators/share";

export async function createShareHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const link = await createShareLink(userId);
  res.status(201).json({ ok: true, share: link });
}

export async function listShareHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const links = await listMyShareLinks(userId);
  res.json({ ok: true, links });
}

export async function revokeShareHandler(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const body = revokeShareSchema.parse(req.body);
  const result = await revokeShareLink(userId, body.token);
  res.json({ ok: true, ...result });
}

export async function publicShareHandler(req: Request, res: Response): Promise<void> {
  const { token } = shareTokenParamSchema.parse(req.params);
  const query = publicShareQuerySchema.parse(req.query);
  const data = await getPublicSharedNotes(token, {
    page: query.page,
    limit: query.limit,
    q: query.q,
  });
  res.json({ ok: true, ...data });
}
