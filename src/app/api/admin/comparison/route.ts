import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createComparisonAdmin,
  listAllComparisonAdmin,
} from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { createComparisonSchema } from "@/lib/validations/admin-comparison";


export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const features = await listAllComparisonAdmin();
    return NextResponse.json({
      ok: true,
      features: features.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[api/admin/comparison] GET Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createComparisonSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { feature, starter, growth, enterprise, sortOrder, published } =
    parsed.data;

  try {
    const row = await createComparisonAdmin({
      feature,
      starter,
      growth,
      enterprise,
      sortOrder: sortOrder ?? 0,
      published: published ?? true,
    });
    return NextResponse.json(
      {
        ok: true,
        feature: {
          ...row,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/admin/comparison] POST Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
