"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { roles } from "@/db/enums";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminToaster } from "@/components/admin/AdminToaster";
import { useAuth } from "@/lib/auth-context";

function isStaffRole(role: string): boolean {
  return roles.includes(role as (typeof roles)[number]);
}

function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isStaffRole(user.role))) {
      router.replace("/admin/login");
    }
  }, [loading, user, router]);

  if (loading || !user || !isStaffRole(user.role)) {
    return null;
  }

  return (
    <>
      <AdminShell email={user.email}>{children}</AdminShell>
      <AdminToaster />
    </>
  );
}

export function AdminDashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
