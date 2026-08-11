import { asc, eq, max } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { navResources } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { createNavResourceSchema } from "@/lib/validations/admin-nav-resources";


export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const items = await (await getDb())
      .select()
      .from(navResources)
      .orderBy(asc(navResources.sortOrder));
    return NextResponse.json({
      ok: true,
      items: items.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[api/admin/nav-resources GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireRole(request, "settings:edit");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createNavResourceSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    let { sortOrder } = parsed.data;
    if (sortOrder === undefined) {
      const [result] = await (await getDb())
        .select({ maxSort: max(navResources.sortOrder) })
        .from(navResources);
      sortOrder = (result?.maxSort ?? -1) + 1;
    }

    const [item] = await (await getDb())
      .insert(navResources)
      .values({
        label: parsed.data.label,
        href: parsed.data.href,
        iconKey: parsed.data.iconKey,
        subtitle: parsed.data.subtitle ?? null,
        visible: parsed.data.visible ?? true,
        external: parsed.data.external ?? false,
        sortOrder,
      })
      .returning();

    revalidatePath("/", "layout");

    return NextResponse.json(
      {
        ok: true,
        item: {
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/admin/nav-resources POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
