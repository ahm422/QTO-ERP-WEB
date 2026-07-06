import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/lib/jwt";

export const COOKIE_ACCESS = "access_token";
export const COOKIE_REFRESH = "refresh_token";
export const COOKIE_CSRF = "csrf_token";

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function isSecureCookieContext(request?: Request): boolean {
  if (!request) {
    return process.env.NODE_ENV === "production";
  }
  const url = new URL(request.url);
  return url.protocol === "https:";
}

function cookieOptions(
  request: Request | undefined,
  maxAge: number,
  httpOnly: boolean,
): string {
  const secure = isSecureCookieContext(request);
  const parts = [
    `Path=/`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
    httpOnly ? "HttpOnly" : "",
    secure ? "Secure" : "",
  ].filter(Boolean);
  return parts.join("; ");
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

type AuthCookieTokens = {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
};

export function setAuthCookies(
  response: NextResponse,
  tokens: AuthCookieTokens,
  request?: Request,
): void {
  const secure = isSecureCookieContext(request);
  response.cookies.set(COOKIE_ACCESS, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  response.cookies.set(COOKIE_REFRESH, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
  response.cookies.set(COOKIE_CSRF, tokens.csrfToken, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookies(
  response: NextResponse,
  request?: Request,
): void {
  const secure = isSecureCookieContext(request);
  for (const [name, httpOnly] of [
    [COOKIE_ACCESS, true],
    [COOKIE_REFRESH, true],
    [COOKIE_CSRF, false],
  ] as const) {
    response.cookies.set(name, "", {
      httpOnly,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

export function buildSetCookieHeaders(
  tokens: AuthCookieTokens,
  request?: Request,
): string[] {
  return [
    `${COOKIE_ACCESS}=${encodeURIComponent(tokens.accessToken)}; ${cookieOptions(request, ACCESS_TOKEN_TTL_SECONDS, true)}`,
    `${COOKIE_REFRESH}=${encodeURIComponent(tokens.refreshToken)}; ${cookieOptions(request, REFRESH_TOKEN_TTL_SECONDS, true)}`,
    `${COOKIE_CSRF}=${encodeURIComponent(tokens.csrfToken)}; ${cookieOptions(request, REFRESH_TOKEN_TTL_SECONDS, false)}`,
  ];
}
