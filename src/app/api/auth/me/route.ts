import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { getDb } from "@/lib/db";
import { ACCESS_TOKEN_TTL_SECONDS, verifyAccessToken } from "@/lib/jwt";
import {
  getRefreshTokenFromRequest,
  loadUserByAccessSub,
  rotateRefreshSession,
} from "@/lib/refresh-session";
import { setRefreshCookie } from "@/lib/session-cookies";

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
}

function getClientMeta(request: Request) {
  return {
    userAgent: request.headers.get("user-agent"),
    ip:
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null,
  };
}

async function resolveUserFromAccessToken(accessToken: string | null) {
  if (!accessToken) return null;
  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;
  return loadUserByAccessSub(payload.sub);
}

export async function GET(request: Request) {
  const bearerToken = getBearerToken(request);
  const user = await resolveUserFromAccessToken(bearerToken);

  if (!user) {
    const rawRefresh = getRefreshTokenFromRequest(request);
    if (rawRefresh) {
      const result = await rotateRefreshSession(rawRefresh, getClientMeta(request));

      if (result.ok) {
        const response = NextResponse.json({
          accessToken: result.accessToken,
          expiresIn: ACCESS_TOKEN_TTL_SECONDS,
          email: result.user.email,
          role: result.user.role,
        });
        setRefreshCookie(response, result.refreshToken, request);
        return response;
      }
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dbUser] = await getDb()
    .select({ email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    email: dbUser.email,
    role: dbUser.role,
  });
}
