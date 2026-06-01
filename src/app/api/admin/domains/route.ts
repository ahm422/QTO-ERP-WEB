import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { requireAdminApi } from "@/lib/require-admin-api";
import { requireResend } from "@/lib/require-resend";
import { resendErrorResponse } from "@/lib/resend-api-error";
import { createDomainSchema } from "@/lib/validations/domain";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const resendResult = requireResend();
  if ("error" in resendResult) return resendResult.error;

  const { data, error } = await resendResult.resend.domains.list();
  if (error) {
    return resendErrorResponse(error);
  }

  return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const resendResult = requireResend();
  if ("error" in resendResult) return resendResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createDomainSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { data, error } = await resendResult.resend.domains.create(parsed.data);
  if (error) {
    return resendErrorResponse(error);
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
