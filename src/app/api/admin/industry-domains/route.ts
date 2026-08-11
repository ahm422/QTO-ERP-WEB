import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createIndustryDomainAdmin,
  listIndustryDomainsAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { createIndustryDomainSchema } from "@/lib/validations/admin-industry-domains";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const items = await listIndustryDomainsAdmin();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/industry-domains GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireRole(request, "content:create");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createIndustryDomainSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const item = await createIndustryDomainAdmin(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/industry-domains POST] Error:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/UNIQUE constraint failed.*slug/i.test(msg)) {
      return jsonError("A domain with this slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}
