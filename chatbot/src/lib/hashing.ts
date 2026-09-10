/**
 * SHA-256 hashing for content change detection.
 * Uses the Web Crypto API (available in Cloudflare Workers).
 */

// Re-export approxTokens from types/core to centralize utility imports.
export { approxTokens } from "../types/core.ts";

/**
 * Compute a SHA-256 hash of a string.
 * Returns a hex-encoded string.
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compute a SHA-256 hash of an object's stable JSON representation.
 * Used to fingerprint raw D1 rows for change detection.
 */
export async function hashRow(row: Record<string, unknown>): Promise<string> {
  const stableKey = JSON.stringify(sortKeys(row));
  return sha256(stableKey);
}

function sortKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);
  const sorted: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    sorted[k] = sortKeys(v);
  }
  return sorted;
}
