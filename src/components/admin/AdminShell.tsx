import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ email, children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader email={email} />
        <AdminBreadcrumb />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
