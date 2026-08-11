import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { jsonError } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { hashRefreshToken, verifyAccessToken } from "@/lib/jwt";
import {
  getAllRefreshTokensFromRequest,
  loadUserByAccessSub,
  revokeOtherRefreshTokensForUser,
} from "@/lib/refresh-session";

const MIN_PASSWORD_LENGTH = 12;

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
}

async function resolveUserFromAccessToken(accessToken: string | null) {
  if (!accessToken) return null;
  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;
  return loadUserByAccessSub(payload.sub);
}

export async function PATCH(request: Request) {
  const bearerToken = getBearerToken(request);
  const user = await resolveUserFromAccessToken(bearerToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const currentPassword =
    typeof (body as { currentPassword?: unknown }).currentPassword === "string"
      ? (body as { currentPassword: string }).currentPassword
      : "";
  const newPassword =
    typeof (body as { newPassword?: unknown }).newPassword === "string"
      ? (body as { newPassword: string }).newPassword
      : "";

  if (!currentPassword) {
    return jsonError("Current password is required.", 400);
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return jsonError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      400,
    );
  }

  if (newPassword === currentPassword) {
    return jsonError(
      "New password must be different from the current password.",
      400,
    );
  }

  try {
    const db = await getDb();
    const [dbUser] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matches = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!matches) {
      return jsonError("Current password is incorrect", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id));

    const refreshTokens = getAllRefreshTokensFromRequest(request);
    let currentTokenHash: string | null = null;
    if (refreshTokens[0]) {
      currentTokenHash = await hashRefreshToken(refreshTokens[0]);
    }

    await revokeOtherRefreshTokensForUser(user.id, currentTokenHash);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/auth/me/password] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
