"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminToaster } from "@/components/admin/AdminToaster";
import { AuthProvider, useAuth } from "@/lib/auth-context";

function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
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
  return (
    <AuthProvider>
      <AdminAuthGate>{children}</AdminAuthGate>
    </AuthProvider>
  );
}
