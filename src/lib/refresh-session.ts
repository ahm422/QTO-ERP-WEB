import { and, eq, isNull } from "drizzle-orm";
import type { Role } from "@/db/enums";
import { refreshTokens, users } from "@/db/schema";
import { getDb } from "@/lib/db";
import {
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
  signAccessToken,
} from "@/lib/jwt";
import {
  COOKIE_REFRESH,
  readCookie,
  readCookieFromHeader,
} from "@/lib/session-cookies";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

export type RefreshResult =
  | {
      ok: true;
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }
  | { ok: false; reason: "missing" | "invalid" | "reuse" };

function refreshExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  const now = new Date();
  await getDb()
    .update(refreshTokens)
    .set({ revokedAt: now })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}

async function loadUserById(userId: string): Promise<AuthUser | null> {
  const [user] = await getDb()
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

export async function rotateRefreshSession(
  rawRefreshToken: string,
  meta?: { userAgent?: string | null; ip?: string | null },
): Promise<RefreshResult> {
  const tokenHash = await hashRefreshToken(rawRefreshToken);
  const db = getDb();

  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row) {
    return { ok: false, reason: "invalid" };
  }

  if (row.revokedAt) {
    console.warn(
      "[auth] Revoked refresh token reuse detected for user",
      row.userId,
    );
    await revokeAllRefreshTokensForUser(row.userId);
    return { ok: false, reason: "reuse" };
  }

  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "invalid" };
  }

  const user = await loadUserById(row.userId);
  if (!user) {
    return { ok: false, reason: "invalid" };
  }

  const now = new Date();
  const newRawRefresh = generateRefreshToken();
  const newHash = await hashRefreshToken(newRawRefresh);

  await db
    .update(refreshTokens)
    .set({ revokedAt: now })
    .where(eq(refreshTokens.id, row.id));

  await db.insert(refreshTokens).values({
    userId: row.userId,
    tokenHash: newHash,
    expiresAt: refreshExpiresAt(),
    userAgent: meta?.userAgent ?? row.userAgent,
    ip: meta?.ip ?? row.ip,
  });

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });

  return {
    ok: true,
    user,
    accessToken,
    refreshToken: newRawRefresh,
  };
}

export async function createRefreshSession(
  user: AuthUser,
  meta?: { userAgent?: string | null; ip?: string | null },
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const rawRefresh = generateRefreshToken();
  const tokenHash = await hashRefreshToken(rawRefresh);

  await getDb().insert(refreshTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt: refreshExpiresAt(),
    userAgent: meta?.userAgent ?? null,
    ip: meta?.ip ?? null,
  });

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });

  return {
    accessToken,
    refreshToken: rawRefresh,
  };
}

export async function revokeRefreshSession(
  rawRefreshToken: string,
): Promise<void> {
  const tokenHash = await hashRefreshToken(rawRefreshToken);
  const now = new Date();
  await getDb()
    .update(refreshTokens)
    .set({ revokedAt: now })
    .where(
      and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)),
    );
}

export function getRefreshTokenFromRequest(request: Request): string | null {
  return readCookie(request, COOKIE_REFRESH);
}

export function getRefreshTokenFromCookieHeader(
  cookieHeader: string | undefined,
): string | null {
  return readCookieFromHeader(cookieHeader, COOKIE_REFRESH);
}

export async function loadUserByAccessSub(sub: string): Promise<AuthUser | null> {
  return loadUserById(sub);
}
