import { adminDomainsGoneResponse } from "@/lib/admin-domains-gone";
import { requireRole } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, _context: RouteContext) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;
  return adminDomainsGoneResponse();
}
