const raw = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export const API_ORIGIN = raw.replace(/\/+$/, "");

/** Base URL with trailing slash for legacy string concatenation */
export const BACKEND_URL = `${API_ORIGIN}/`;
