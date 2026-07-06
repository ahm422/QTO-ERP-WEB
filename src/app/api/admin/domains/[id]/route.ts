import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { requireAdminApi } from "@/lib/require-admin-api";
import { requireResend } from "@/lib/require-resend";
import { resendErrorResponse } from "@/lib/resend-api-error";
import { updateDomainSchema } from "@/lib/validations/domain";


type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const resendResult = requireResend();
  if ("error" in resendResult) return resendResult.error;

  const { id } = await context.params;
  const { data, error } = await resendResult.resend.domains.get(id);
  if (error) {
    return resendErrorResponse(error);
  }

  return NextResponse.json({ ok: true, data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const resendResult = requireResend();
  if ("error" in resendResult) return resendResult.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateDomainSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { data, error } = await resendResult.resend.domains.update({
    id,
    ...parsed.data,
  });
  if (error) {
    return resendErrorResponse(error);
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const resendResult = requireResend();
  if ("error" in resendResult) return resendResult.error;

  const { id } = await context.params;
  const { data, error } = await resendResult.resend.domains.remove(id);
  if (error) {
    return resendErrorResponse(error);
  }

  return NextResponse.json({ ok: true, data });
}
