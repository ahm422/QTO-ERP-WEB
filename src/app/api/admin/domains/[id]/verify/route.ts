import { adminDomainsGoneResponse } from "@/lib/admin-domains-gone";
import { requireAdminApi } from "@/lib/require-admin-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, _context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;
  return adminDomainsGoneResponse();
}
