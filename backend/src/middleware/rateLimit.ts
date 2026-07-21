import rateLimit from "express-rate-limit";
import {
  AUTH_RATE_LIMIT_MAX,
  NODE_ENV,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "../config/env";

const standardHeaders = true;
const legacyHeaders = false;

export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders,
  legacyHeaders,
  message: {
    ok: false,
    error: { message: "Too many requests, please try again shortly." },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  standardHeaders,
  legacyHeaders,
  skipSuccessfulRequests: NODE_ENV !== "production",
  message: {
    ok: false,
    error: { message: "Too many auth attempts, please try again shortly." },
  },
});
