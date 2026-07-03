import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getPrisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";
import { createNavResourceSchema } from "@/lib/validations/admin-nav-resources";


export async function GET() {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  try {
    const items = await getPrisma().navResource.findMany({
      orderBy: { sortOrder: "asc" },
    });
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
  const admin = await requireAdminApi();
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
      const max = await getPrisma().navResource.aggregate({ _max: { sortOrder: true } });
      sortOrder = (max._max.sortOrder ?? -1) + 1;
    }

    const item = await getPrisma().navResource.create({
      data: {
        label:     parsed.data.label,
        href:      parsed.data.href,
        iconKey:   parsed.data.iconKey,
        subtitle:  parsed.data.subtitle ?? null,
        visible:   parsed.data.visible ?? true,
        external:  parsed.data.external ?? false,
        sortOrder,
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json(
      {
        ok: true,
        item: { ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/admin/nav-resources POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
