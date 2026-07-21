import "dotenv/config";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
}

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const PORT = Number(process.env.PORT ?? 3000);
export const DATABASE_URL = requireEnv("DATABASE_URL");
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true" || NODE_ENV === "production";
export const TRUST_PROXY = process.env.TRUST_PROXY === "true" || NODE_ENV === "production";
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
export const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 300);
export const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 20);
