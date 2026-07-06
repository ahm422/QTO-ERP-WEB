import { NextResponse } from "next/server";
import { REFRESH_TOKEN_TTL_SECONDS } from "@/lib/jwt";

export const COOKIE_REFRESH = "refresh_token";

const REFRESH_COOKIE_PATH = "/api/auth";
const LEGACY_REFRESH_COOKIE_PATH = "/api/auth/refresh";

export function isSecureCookieContext(request?: Request): boolean {
  if (!request) {
    return process.env.NODE_ENV === "production";
  }
  return new URL(request.url).protocol === "https:";
}

function parseCookieHeader(cookieHeader: string | undefined, name: string): string[] {
  if (!cookieHeader) return [];
  const values: string[] = [];
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      values.push(decodeURIComponent(rest.join("=")));
    }
  }
  return values;
}

export function readAllCookies(request: Request, name: string): string[] {
  return parseCookieHeader(request.headers.get("cookie") ?? undefined, name);
}

function refreshCookieOptions(request: Request | undefined, path: string) {
  return {
    httpOnly: true,
    secure: isSecureCookieContext(request),
    sameSite: "strict" as const,
    path,
  };
}

function clearLegacyRefreshCookie(
  response: NextResponse,
  request?: Request,
): void {
  response.cookies.set(COOKIE_REFRESH, "", {
    ...refreshCookieOptions(request, LEGACY_REFRESH_COOKIE_PATH),
    maxAge: 0,
  });
}

export function setRefreshCookie(
  response: NextResponse,
  refreshToken: string,
  request?: Request,
): void {
  clearLegacyRefreshCookie(response, request);
  response.cookies.set(COOKIE_REFRESH, refreshToken, {
    ...refreshCookieOptions(request, REFRESH_COOKIE_PATH),
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearRefreshCookie(
  response: NextResponse,
  request?: Request,
): void {
  response.cookies.set(COOKIE_REFRESH, "", {
    ...refreshCookieOptions(request, REFRESH_COOKIE_PATH),
    maxAge: 0,
  });
  clearLegacyRefreshCookie(response, request);
}
