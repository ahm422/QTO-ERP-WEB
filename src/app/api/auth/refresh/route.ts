import { NextResponse } from "next/server";
import {
  getRefreshTokenFromRequest,
  rotateRefreshSession,
} from "@/lib/refresh-session";
import { clearAuthCookies, setAuthCookies } from "@/lib/session-cookies";

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
    clearAuthCookies(response, request);
    return response;
  }

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
