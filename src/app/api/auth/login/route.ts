import { NextResponse } from "next/server";
import type { Role } from "@/db/enums";
import { verifyUserCredentials } from "@/lib/auth-credentials";
import { ACCESS_TOKEN_TTL_SECONDS } from "@/lib/jwt";
import { createRefreshSession } from "@/lib/refresh-session";
import { setRefreshCookie } from "@/lib/session-cookies";

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email =
    typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email
      : null;
  const password =
    typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : null;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const user = await verifyUserCredentials(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const tokens = await createRefreshSession(
    { id: user.id, email: user.email, role: user.role as Role },
    getClientMeta(request),
  );

  const response = NextResponse.json({
    accessToken: tokens.accessToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    email: user.email,
    role: user.role,
  });
  setRefreshCookie(response, tokens.refreshToken, request);
  return response;
}
