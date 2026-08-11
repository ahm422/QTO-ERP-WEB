import { and, eq, isNull } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { passwordResetTokens } from "@/db/schema";
import { getDb } from "@/lib/db";
import { generateRefreshToken, hashRefreshToken } from "@/lib/jwt";

/** Invite and forgot-password tokens share a 1-hour TTL. */
export const PASSWORD_RESET_TTL_SECONDS = 60 * 60;

export function buildSetPasswordUrl(rawToken: string): string {
  const base = (process.env.AUTH_URL ?? "").replace(/\/$/, "");
  if (!base) {
    throw new Error("AUTH_URL is not configured");
  }
  return `${base}/admin/reset-password?token=${encodeURIComponent(rawToken)}`;
}

/**
 * Create a single-use password-reset / invite token.
 * Invalidates prior unused tokens for the user. Returns the raw token once.
 */
export async function createPasswordResetToken(
  userId: string,
  ttlSeconds: number = PASSWORD_RESET_TTL_SECONDS,
): Promise<string> {
  const db = await getDb();
  const now = new Date();

  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(passwordResetTokens.userId, userId),
        isNull(passwordResetTokens.usedAt),
      ),
    );

  const raw = generateRefreshToken();
  const tokenHash = await hashRefreshToken(raw);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await db.insert(passwordResetTokens).values({
    id: createId(),
    userId,
    tokenHash,
    expiresAt,
    createdAt: now,
  });

  return raw;
}

export type ConsumePasswordResetResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

/**
 * Validate and consume a raw password-reset token (single-use).
 */
export async function consumePasswordResetToken(
  raw: string,
): Promise<ConsumePasswordResetResult> {
  const tokenHash = await hashRefreshToken(raw);
  const db = await getDb();

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row) {
    return { ok: false, reason: "invalid" };
  }
  if (row.usedAt) {
    return { ok: false, reason: "used" };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const now = new Date();
  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(passwordResetTokens.id, row.id));

  return { ok: true, userId: row.userId };
}
