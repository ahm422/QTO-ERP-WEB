"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

type AdminHeaderProps = {
  email: string;
};

export function AdminHeader({ email }: AdminHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <p className="text-sm text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void logout()}
      >
        Sign out
      </Button>
    </header>
  );
}
