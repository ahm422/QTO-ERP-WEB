"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  DollarSign,
  Video,
  Table2,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/demo-requests",
    label: "Demo requests",
    icon: MessageSquare,
  },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { href: "/admin/demo-videos", label: "Demo videos", icon: Video },
  { href: "/admin/comparison", label: "Comparison", icon: Table2 },
  { href: "/admin/site-settings", label: "Site settings", icon: Settings2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-5">
        <Link href="/admin" className="text-lg font-semibold text-foreground">
          QTO Admin
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
