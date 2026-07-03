import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getPrisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateDemoRequestStatusSchema } from "@/lib/validations/admin-demo-request";


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

  const parsed = updateDemoRequestStatusSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const existing = await getPrisma().demoRequest.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Demo request not found", 404);
    }

    const updated = await getPrisma().demoRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      ok: true,
      request: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/admin/demo-requests/[id]] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
