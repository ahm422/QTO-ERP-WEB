/**
 * Constant-time admin authentication for operational endpoints (e.g. `POST /index`).
 *
 * The token comes from the `CHATBOT_ADMIN_TOKEN` secret. Comparison is
 * constant-time to avoid leaking the token length/prefix via timing.
 */
import type { Env } from "../types/env.ts";

/** Timing-safe string comparison (accumulates XOR over the full max length). */
export function constantTimeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  const max = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < max; i += 1) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export function extractAdminToken(request: Request): string {
  const auth = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  if (match) return match[1].trim();
  return (request.headers.get("x-chatbot-admin-token") ?? "").trim();
}

export interface AdminAuthResult {
  ok: boolean;
  status: number;
  error?: string;
}

export function authorizeAdmin(request: Request, env: Env): AdminAuthResult {
  const expected = (env.CHATBOT_ADMIN_TOKEN ?? "").trim();
  if (expected.length === 0) {
    return { ok: false, status: 503, error: "Index endpoint is not configured" };
  }

  const provided = extractAdminToken(request);
  if (provided.length === 0 || !constantTimeEqual(provided, expected)) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true, status: 200 };
}
