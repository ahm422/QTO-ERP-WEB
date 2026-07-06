import { AdminDashboardClientLayout } from "./client-layout";

export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDashboardClientLayout>{children}</AdminDashboardClientLayout>;
}
