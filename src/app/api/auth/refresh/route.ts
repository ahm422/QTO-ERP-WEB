import { NextResponse } from "next/server";
import { ACCESS_TOKEN_TTL_SECONDS } from "@/lib/jwt";
import {
  getRefreshTokenFromRequest,
  rotateRefreshSession,
} from "@/lib/refresh-session";
import { clearRefreshCookie, setRefreshCookie } from "@/lib/session-cookies";

function getClientMeta(request: Request) {
  return {
    userAgent: request.headers.get("user-agent"),
    ip:
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null,
  };
}

export async function POST(request: Request) {
  const rawRefresh = getRefreshTokenFromRequest(request);
  if (!rawRefresh) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await rotateRefreshSession(rawRefresh, getClientMeta(request));

  if (!result.ok) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    clearRefreshCookie(response, request);
    return response;
  }

  const response = NextResponse.json({
    accessToken: result.accessToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    email: result.user.email,
    role: result.user.role,
  });
  setRefreshCookie(response, result.refreshToken, request);
  return response;
}
