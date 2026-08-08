import { and, desc, eq, gte, isNull } from "drizzle-orm";
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
  readAllCookies,
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

/** Allow a recently-rotated token to be replayed once (React Strict Mode / parallel tab). */
const ROTATION_GRACE_MS = 10_000;

async function tryGraceRotationReplay(
  row: typeof refreshTokens.$inferSelect,
): Promise<RefreshResult | null> {
  if (!row.revokedAt) return null;

  const revokedMs = row.revokedAt.getTime();
  if (Date.now() - revokedMs > ROTATION_GRACE_MS) {
    return null;
  }

  const db = await getDb();
  const [successor] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.userId, row.userId),
        isNull(refreshTokens.revokedAt),
        gte(refreshTokens.createdAt, row.revokedAt),
      ),
    )
    .orderBy(desc(refreshTokens.createdAt))
    .limit(1);

  if (!successor || successor.expiresAt.getTime() < Date.now()) {
    return null;
  }

  const user = await loadUserById(row.userId);
  if (!user) {
    return null;
  }

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });
  return {
    ok: true,
    user,
    accessToken,
    // Cookie already updated by the winning parallel rotation — do not overwrite.
    refreshToken: "",
  };
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  const now = new Date();
  await (await getDb())
    .update(refreshTokens)
    .set({ revokedAt: now })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}

async function loadUserById(userId: string): Promise<AuthUser | null> {
  const [user] = await (await getDb())
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
  options?: { revokeAllOnReuse?: boolean },
): Promise<RefreshResult> {
  const tokenHash = await hashRefreshToken(rawRefreshToken);
  const db = await getDb();

  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row) {
    return { ok: false, reason: "invalid" };
  }

  if (row.revokedAt) {
    const grace = await tryGraceRotationReplay(row);
    if (grace) {
      return grace;
    }

    if (options?.revokeAllOnReuse !== false) {
      console.warn(
        "[auth] Revoked refresh token reuse detected for user",
        row.userId,
      );
      await revokeAllRefreshTokensForUser(row.userId);
    }
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

  await (await getDb()).insert(refreshTokens).values({
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
  await (await getDb())
    .update(refreshTokens)
    .set({ revokedAt: now })
    .where(
      and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)),
    );
}

export function getAllRefreshTokensFromRequest(request: Request): string[] {
  return [...new Set(readAllCookies(request, COOKIE_REFRESH).filter(Boolean))];
}

export async function rotateRefreshSessionFromRequest(
  request: Request,
  meta?: { userAgent?: string | null; ip?: string | null },
): Promise<RefreshResult | { ok: false; reason: "missing" }> {
  const tokens = getAllRefreshTokensFromRequest(request);
  if (tokens.length === 0) {
    return { ok: false, reason: "missing" };
  }

  let lastResult: RefreshResult = { ok: false, reason: "invalid" };

  for (let i = 0; i < tokens.length; i++) {
    const isLast = i === tokens.length - 1;
    const result = await rotateRefreshSession(tokens[i]!, meta, {
      revokeAllOnReuse: isLast,
    });
    if (result.ok) {
      return result;
    }
    lastResult = result;
    if (result.reason === "reuse") {
      continue;
    }
  }

  return lastResult;
}

export async function revokeAllRefreshSessionsFromRequest(
  request: Request,
): Promise<void> {
  for (const token of getAllRefreshTokensFromRequest(request)) {
    await revokeRefreshSession(token);
  }
}

export async function loadUserByAccessSub(sub: string): Promise<AuthUser | null> {
  return loadUserById(sub);
}
