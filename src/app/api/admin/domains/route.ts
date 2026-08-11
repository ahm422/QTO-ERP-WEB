import { adminDomainsGoneResponse } from "@/lib/admin-domains-gone";
import { requireRole } from "@/lib/permissions";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;
  return adminDomainsGoneResponse();
}

export async function POST(request: Request) {
  const admin = await requireRole(request, "content:create");
  if ("error" in admin) return admin.error;
  return adminDomainsGoneResponse();
}
