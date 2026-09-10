/**
 * Phase 2 — Worker-compatible rate limiting.
 *
 * Fixed-window counter kept in an in-memory Map. This is intentionally simple
 * and dependency-free. IMPORTANT: this is PER-ISOLATE only. It limits abuse
 * from a single Worker instance but does NOT provide a global/distributed
 * guarantee across colos or isolates. For global limits use Cloudflare's
 * Rate Limiting binding or a Durable Object.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000;
const buckets = new Map<string, Bucket>();

/**
 * Check (and consume) one unit for `key`.
 * A `limitPerMinute` <= 0 disables limiting.
 */
export function checkRateLimit(
  key: string,
  limitPerMinute: number,
  nowMs: number = Date.now(),
): RateLimitResult {
  if (!Number.isFinite(limitPerMinute) || limitPerMinute <= 0) {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, retryAfterSeconds: 0 };
  }

  const existing = buckets.get(key);
  if (!existing || nowMs - existing.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: nowMs });
    return { allowed: true, remaining: limitPerMinute - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limitPerMinute) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((WINDOW_MS - (nowMs - existing.windowStart)) / 1000),
    );
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, remaining: limitPerMinute - existing.count, retryAfterSeconds: 0 };
}

/** Test/maintenance helper: clear all counters. */
export function resetRateLimiter(): void {
  buckets.clear();
}
