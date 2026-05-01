import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      /** Set by auth middleware after JWT verification */
      auth?: JwtPayload & { sub?: string };
    }
  }
}

export {};
