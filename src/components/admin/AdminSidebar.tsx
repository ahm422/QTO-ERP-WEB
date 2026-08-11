"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/components/admin/admin-routes";
import { useAuth } from "@/lib/auth-context";

export function AdminSidebar() {
  const pathname = usePathname();
  const { can } = useAuth();

  const visibleItems = adminNavItems.filter(
    (item) => !item.capability || can(item.capability),
  );

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-4 py-5">
        <Link
          href="/admin"
          className="font-display text-lg font-semibold tracking-tight text-sidebar-foreground"
        >
          QTO Admin
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {visibleItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
