import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { DemoReplyEmail } from "@/emails/demo-reply";
import { demoRequests } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { sendEmail } from "@/lib/email";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { demoRequestReplySchema } from "@/lib/validations/admin-demo-request";


type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = demoRequestReplySchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const [demoRequest] = await (await getDb())
    .select()
    .from(demoRequests)
    .where(eq(demoRequests.id, id))
    .limit(1);
  if (!demoRequest) {
    return jsonError("Demo request not found", 404);
  }

  const emailResult = await sendEmail({
    to: demoRequest.email,
    subject: parsed.data.subject,
    react: DemoReplyEmail({
      name: demoRequest.name,
      body: parsed.data.body,
    }),
  });

  if (!emailResult.ok) {
    return NextResponse.json(
      { ok: false, error: emailResult.error },
      { status: 502 },
    );
  }

  try {
    const [updated] = await (await getDb())
      .update(demoRequests)
      .set({ status: "READ" })
      .where(eq(demoRequests.id, id))
      .returning();

    return NextResponse.json({
      ok: true,
      request: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/admin/demo-requests/[id]/reply] Error:", err);
    return jsonError("Email sent but status update failed.", 500);
  }
}
