import { NextResponse } from "next/server";
import { ACCESS_TOKEN_TTL_SECONDS } from "@/lib/jwt";
import { getClientMeta } from "@/lib/auth-request-meta";
import { rotateRefreshSessionFromRequest } from "@/lib/refresh-session";
import { clearRefreshCookie, setRefreshCookie } from "@/lib/session-cookies";

export async function POST(request: Request) {
  const result = await rotateRefreshSessionFromRequest(request, getClientMeta(request));

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
  if (result.refreshToken) {
    setRefreshCookie(response, result.refreshToken, request);
  }
  return response;
}
