import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { requireResend } from "@/lib/require-resend";
import { resendErrorResponse } from "@/lib/resend-api-error";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const resendResult = requireResend();
  if ("error" in resendResult) return resendResult.error;

  const { id } = await context.params;
  const { data, error } = await resendResult.resend.domains.verify(id);
  if (error) {
    return resendErrorResponse(error);
  }

  return NextResponse.json({ ok: true, data });
}
