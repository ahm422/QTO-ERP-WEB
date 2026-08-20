function collectErrorText(err: unknown, seen: Set<unknown> = new Set()): string {
  if (err == null) return "";
  if (typeof err === "string" || typeof err === "number" || typeof err === "boolean") {
    return String(err);
  }
  if (typeof err !== "object") return "";
  if (seen.has(err)) return "";
  seen.add(err);

  const parts: string[] = [];
  if (err instanceof Error) {
    parts.push(err.name, err.message);
  }

  const rec = err as Record<string, unknown>;
  for (const key of ["message", "code", "cause"] as const) {
    if (key in rec && rec[key] != null) {
      parts.push(collectErrorText(rec[key], seen));
    }
  }

  return parts.filter(Boolean).join(" ");
}

/**
 * Detect SQLite / D1 unique-constraint failures, including drizzle-orm
 * `DrizzleQueryError` wrappers whose own message is `Failed query: ...`
 * and whose unique text lives on `cause` (production Worker shape for
 * POST /api/subscribe duplicates).
 */
export function isSqliteUniqueConstraintError(err: unknown): boolean {
  const text = collectErrorText(err).toLowerCase();
  if (!text) return false;
  // Missing tables and other D1 failures must stay 500, not 409.
  if (text.includes("no such table")) return false;

  if (text.includes("unique constraint failed")) return true;
  if (text.includes("sqlite_constraint_unique")) return true;
  if (text.includes("d1_error") && text.includes("unique")) return true;
  if (/\b2067\b/.test(text)) return true;
  return false;
}
