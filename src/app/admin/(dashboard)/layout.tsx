import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminToaster } from "@/components/admin/AdminToaster";

export const runtime = "nodejs";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <>
      <AdminShell email={session.user.email}>{children}</AdminShell>
      <AdminToaster />
    </>
  );
}
