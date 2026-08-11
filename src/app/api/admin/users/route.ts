import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import { desc, eq, isNotNull, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { roles, type Role } from "@/db/enums";
import { users } from "@/db/schema";
import { UserInviteEmail } from "@/emails/user-invite";
import { jsonError } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { requireRole } from "@/lib/permissions";
import {
  buildSetPasswordUrl,
  createPasswordResetToken,
} from "@/lib/password-reset";

const roleSet = new Set<string>(roles);

type UserDto = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
  disabledAt: string | null;
};

function toUserDto(row: {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  disabledAt: Date | null;
}): UserDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    disabledAt: row.disabledAt ? row.disabledAt.toISOString() : null,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function randomTempPassword(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: Request) {
  const admin = await requireRole(request, "users:manage");
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // active | disabled | all (default)

  try {
    const statusFilter =
      status === "active"
        ? isNull(users.disabledAt)
        : status === "disabled"
          ? isNotNull(users.disabledAt)
          : undefined;

    const rows = await (await getDb())
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        disabledAt: users.disabledAt,
      })
      .from(users)
      .where(statusFilter)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({
      ok: true,
      users: rows.map(toUserDto),
    });
  } catch (err) {
    console.error("[api/admin/users] GET Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireRole(request, "users:manage");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const emailRaw =
    typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email
      : "";
  const name =
    typeof (body as { name?: unknown }).name === "string"
      ? (body as { name: string }).name.trim() || null
      : null;
  const roleRaw =
    typeof (body as { role?: unknown }).role === "string"
      ? (body as { role: string }).role
      : "";

  const email = normalizeEmail(emailRaw);
  if (!email || !isValidEmail(email)) {
    return jsonError("A valid email is required.", 400);
  }
  if (!roleSet.has(roleRaw)) {
    return jsonError("Invalid role.", 400);
  }
  const role = roleRaw as Role;

  const db = await getDb();

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return jsonError("A user with that email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(randomTempPassword(), 12);
    const id = createId();
    const now = new Date();

    await db.insert(users).values({
      id,
      email,
      name,
      role,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    let setPasswordUrl: string;
    try {
      const raw = await createPasswordResetToken(id);
      setPasswordUrl = buildSetPasswordUrl(raw);
    } catch (err) {
      console.error("[api/admin/users] token/url error:", err);
      await db.delete(users).where(eq(users.id, id));
      return jsonError("Failed to create invite link.", 500);
    }

    const emailResult = await sendEmail({
      to: email,
      subject: "You're invited to QTO Admin",
      react: UserInviteEmail({
        name,
        email,
        setPasswordUrl,
        invitedBy: admin.user.email,
      }),
    });

    if (!emailResult.ok) {
      console.error(
        "[api/admin/users] invite email failed:",
        emailResult.error,
      );
      await db.delete(users).where(eq(users.id, id));
      return jsonError(
        `Failed to send invite email via Cloudflare Email. ${emailResult.error}`,
        502,
      );
    }

    const [created] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        disabledAt: users.disabledAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return NextResponse.json(
      { ok: true, user: toUserDto(created!) },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/admin/users] POST Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
