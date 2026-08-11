import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { contactInquiries } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { updateContactInquiryStatusSchema } from "@/lib/validations/admin-contact";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateContactInquiryStatusSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const [existing] = await (await getDb())
      .select()
      .from(contactInquiries)
      .where(eq(contactInquiries.id, id))
      .limit(1);
    if (!existing) {
      return jsonError("Contact inquiry not found", 404);
    }

    const [updated] = await (await getDb())
      .update(contactInquiries)
      .set({ status: parsed.data.status })
      .where(eq(contactInquiries.id, id))
      .returning();

    return NextResponse.json({
      ok: true,
      inquiry: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/admin/contact-inquiries/[id]] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
