import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { jsonError } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { consumePasswordResetToken } from "@/lib/password-reset";
import { revokeAllRefreshTokensForUser } from "@/lib/refresh-session";

const MIN_PASSWORD_LENGTH = 12;
const GENERIC_TOKEN_ERROR = "Invalid or expired reset link.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const token =
    typeof (body as { token?: unknown }).token === "string"
      ? (body as { token: string }).token.trim()
      : "";
  const password =
    typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (!token) {
    return jsonError(GENERIC_TOKEN_ERROR, 400);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      400,
    );
  }

  try {
    const consumed = await consumePasswordResetToken(token);
    if (!consumed.ok) {
      return jsonError(GENERIC_TOKEN_ERROR, 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const db = await getDb();

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, consumed.userId));

    await revokeAllRefreshTokensForUser(consumed.userId);

    return NextResponse.json({
      ok: true,
      message: "Password updated. You can sign in with your new password.",
    });
  } catch (err) {
    console.error("[api/auth/reset-password] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
