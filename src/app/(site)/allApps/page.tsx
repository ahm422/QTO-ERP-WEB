import { listPublishedModulesFull } from "@/lib/content-db";
import AllAppsGrid from "./_components/AllAppsGrid";

export const runtime = "nodejs";

export default async function AllAppsPage() {
  const modules = await listPublishedModulesFull();
  return <AllAppsGrid modules={modules} />;
}
