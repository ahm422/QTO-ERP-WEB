import { NextResponse } from "next/server";
import { validateCsrf } from "@/lib/csrf";
import {
  getRefreshTokenFromRequest,
  revokeRefreshSession,
} from "@/lib/refresh-session";
import { clearAuthCookies } from "@/lib/session-cookies";

export async function POST(request: Request) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawRefresh = getRefreshTokenFromRequest(request);
  if (rawRefresh) {
    await revokeRefreshSession(rawRefresh);
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response, request);
  return response;
}
