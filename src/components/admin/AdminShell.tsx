"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  AdminMobileSidebar,
  AdminSidebar,
} from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ email, children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <AdminMobileSidebar
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          email={email}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        {/* Full-bleed content column: padding only — pages must not reintroduce mx-auto max-w-* page chrome; use AdminFormWidth / AdminPage for full-width stacks. */}
        <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
