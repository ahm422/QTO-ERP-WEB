import { adminDomainsGoneResponse } from "@/lib/admin-domains-gone";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;
  return adminDomainsGoneResponse();
}

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;
  return adminDomainsGoneResponse();
}
