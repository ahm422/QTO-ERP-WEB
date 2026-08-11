import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { roles, type Role } from "@/db/enums";
import { users } from "@/db/schema";
import { jsonError } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { revokeAllRefreshTokensForUser } from "@/lib/refresh-session";

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

async function countActiveSuperAdmins(
  excludeUserId?: string,
): Promise<number> {
  const db = await getDb();
  const conditions = [
    eq(users.role, "SUPER_ADMIN"),
    isNull(users.disabledAt),
  ];
  if (excludeUserId) {
    conditions.push(ne(users.id, excludeUserId));
  }
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(...conditions));
  return Number(row?.count ?? 0);
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "users:manage");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const db = await getDb();
  const [target] = await db
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

  if (!target) {
    return jsonError("User not found.", 404);
  }

  const updates: {
    name?: string | null;
    role?: Role;
    disabledAt?: Date | null;
  } = {};

  if ("name" in (body as object)) {
    const nameVal = (body as { name?: unknown }).name;
    if (nameVal === null) {
      updates.name = null;
    } else if (typeof nameVal === "string") {
      updates.name = nameVal.trim() || null;
    } else {
      return jsonError("Invalid name.", 400);
    }
  }

  if ("role" in (body as object)) {
    const roleRaw = (body as { role?: unknown }).role;
    if (typeof roleRaw !== "string" || !roleSet.has(roleRaw)) {
      return jsonError("Invalid role.", 400);
    }
    updates.role = roleRaw as Role;
  }

  let deactivating = false;
  let activating = false;

  if ("disabled" in (body as object)) {
    const disabled = (body as { disabled?: unknown }).disabled;
    if (typeof disabled !== "boolean") {
      return jsonError("Invalid disabled flag.", 400);
    }
    if (disabled) {
      deactivating = true;
      updates.disabledAt = new Date();
    } else {
      activating = true;
      updates.disabledAt = null;
    }
  } else if ("disabledAt" in (body as object)) {
    const disabledAt = (body as { disabledAt?: unknown }).disabledAt;
    if (disabledAt === null) {
      activating = true;
      updates.disabledAt = null;
    } else if (typeof disabledAt === "string" || disabledAt instanceof Date) {
      deactivating = true;
      updates.disabledAt = new Date(disabledAt as string | Date);
    } else {
      return jsonError("Invalid disabledAt.", 400);
    }
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("No valid fields to update.", 400);
  }

  const nextRole = updates.role ?? target.role;
  const willBeDisabled =
    deactivating ||
    (!activating && target.disabledAt != null) ||
    (updates.disabledAt != null && updates.disabledAt !== undefined);

  const isCurrentlyActiveSuperAdmin =
    target.role === "SUPER_ADMIN" && target.disabledAt == null;

  if (isCurrentlyActiveSuperAdmin) {
    const losingSuperAdminStatus =
      nextRole !== "SUPER_ADMIN" || willBeDisabled;

    if (losingSuperAdminStatus) {
      const others = await countActiveSuperAdmins(target.id);
      if (others < 1) {
        return jsonError(
          "Cannot demote or disable the last Super Admin.",
          400,
        );
      }
    }
  }

  try {
    await db.update(users).set(updates).where(eq(users.id, id));

    if (deactivating || (updates.disabledAt != null && updates.disabledAt)) {
      await revokeAllRefreshTokensForUser(id);
    }

    const [updated] = await db
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

    return NextResponse.json({ ok: true, user: toUserDto(updated!) });
  } catch (err) {
    console.error("[api/admin/users/[id]] PATCH Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "users:manage");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  const db = await getDb();

  const [target] = await db
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

  if (!target) {
    return jsonError("User not found.", 404);
  }

  if (target.disabledAt != null) {
    return NextResponse.json({ ok: true, user: toUserDto(target) });
  }

  if (target.role === "SUPER_ADMIN") {
    const others = await countActiveSuperAdmins(target.id);
    if (others < 1) {
      return jsonError("Cannot disable the last Super Admin.", 400);
    }
  }

  try {
    const now = new Date();
    await db
      .update(users)
      .set({ disabledAt: now })
      .where(eq(users.id, id));

    await revokeAllRefreshTokensForUser(id);

    const [updated] = await db
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

    return NextResponse.json({ ok: true, user: toUserDto(updated!) });
  } catch (err) {
    console.error("[api/admin/users/[id]] DELETE Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
