import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { navResources } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateNavResourceSchema } from "@/lib/validations/admin-nav-resources";


type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateNavResourceSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const [existing] = await getDb()
      .select()
      .from(navResources)
      .where(eq(navResources.id, id))
      .limit(1);
    if (!existing) return jsonError("Nav resource not found", 404);

    const [item] = await getDb()
      .update(navResources)
      .set(parsed.data)
      .where(eq(navResources.id, id))
      .returning();

    revalidatePath("/", "layout");

    return NextResponse.json({
      ok: true,
      item: {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/admin/nav-resources/[id] PATCH] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const [existing] = await getDb()
      .select()
      .from(navResources)
      .where(eq(navResources.id, id))
      .limit(1);
    if (!existing) return jsonError("Nav resource not found", 404);

    await getDb().delete(navResources).where(eq(navResources.id, id));

    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/nav-resources/[id] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
