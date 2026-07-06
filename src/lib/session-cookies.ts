import { NextResponse } from "next/server";
import { REFRESH_TOKEN_TTL_SECONDS } from "@/lib/jwt";

export const COOKIE_REFRESH = "refresh_token";

const REFRESH_COOKIE_PATH = "/api/auth/refresh";

export function isSecureCookieContext(request?: Request): boolean {
  if (!request) {
    return process.env.NODE_ENV === "production";
  }
  const url = new URL(request.url);
  return url.protocol === "https:";
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

export function readCookieFromHeader(
  cookieHeader: string | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

function refreshCookieOptions(request: Request | undefined) {
  return {
    httpOnly: true,
    secure: isSecureCookieContext(request),
    sameSite: "strict" as const,
    path: REFRESH_COOKIE_PATH,
  };
}

export function setRefreshCookie(
  response: NextResponse,
  refreshToken: string,
  request?: Request,
): void {
  response.cookies.set(COOKIE_REFRESH, refreshToken, {
    ...refreshCookieOptions(request),
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearRefreshCookie(
  response: NextResponse,
  request?: Request,
): void {
  response.cookies.set(COOKIE_REFRESH, "", {
    ...refreshCookieOptions(request),
    maxAge: 0,
  });
}
