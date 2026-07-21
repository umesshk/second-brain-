import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import { FRONTEND_ORIGIN, TRUST_PROXY } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { apiRateLimiter, authRateLimiter } from "./middleware/rateLimit";
import userRoutes from "./routes/userRoutes";
import noteRoutes from "./routes/noteRoutes";
import tagRoutes from "./routes/tagRoutes";
import shareRoutes from "./routes/shareRoutes";
import publicRoutes from "./routes/publicRoutes";

export function createApp() {
  const app = express();
  if (TRUST_PROXY) {
    app.set("trust proxy", 1);
  }
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: FRONTEND_ORIGIN,
      credentials: true,
    })
  );
  app.options("*", cors({ origin: FRONTEND_ORIGIN, credentials: true }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/user", authRateLimiter, userRoutes);
  app.use("/api/v1", apiRateLimiter);
  app.use("/api/v1", noteRoutes);
  app.use("/api/v1", tagRoutes);
  app.use("/api/v1", shareRoutes);
  app.use("/api/v1", publicRoutes);

  app.use(errorHandler);
  return app;
}
