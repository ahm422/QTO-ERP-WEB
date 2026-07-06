import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { getDb } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import {
  getRefreshTokenFromRequest,
  loadUserByAccessSub,
  rotateRefreshSession,
} from "@/lib/refresh-session";
import {
  COOKIE_ACCESS,
  readCookie,
  setAuthCookies,
} from "@/lib/session-cookies";

async function resolveUserFromAccessToken(accessToken: string | null) {
  if (!accessToken) return null;
  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;
  return loadUserByAccessSub(payload.sub);
}

export async function GET(request: Request) {
  const accessToken = readCookie(request, COOKIE_ACCESS);
  const user = await resolveUserFromAccessToken(accessToken);

  if (!user) {
    const rawRefresh = getRefreshTokenFromRequest(request);
    if (rawRefresh) {
      const result = await rotateRefreshSession(rawRefresh, {
        userAgent: request.headers.get("user-agent"),
        ip:
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          null,
      });

      if (result.ok) {
        const response = NextResponse.json({
          email: result.user.email,
          role: result.user.role,
        });
        setAuthCookies(
          response,
          {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            csrfToken: result.csrfToken,
          },
          request,
        );
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
