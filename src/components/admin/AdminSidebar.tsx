"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSectionNavItems,
  getVisibleSections,
  type AdminNavItem,
  type AdminNavSection,
} from "@/components/admin/admin-routes";
import { useAuth } from "@/lib/auth-context";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

const COLLAPSED_STORAGE_KEY = "qto-admin-nav-collapsed";

type CollapsedMap = Record<string, boolean>;

function isItemActive(pathname: string, item: AdminNavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function findActiveSectionId(
  sections: AdminNavSection[],
  pathname: string,
): string | null {
  for (const section of sections) {
    if (getSectionNavItems(section).some((item) => isItemActive(pathname, item))) {
      return section.id;
    }
  }
  return null;
}

function readCollapsedMap(): CollapsedMap {
  try {
    const raw = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const result: CollapsedMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeCollapsedMap(map: CollapsedMap): void {
  try {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function NavLinkItem({
  item,
  pathname,
  onNavigate,
}: {
  item: AdminNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const { href, label, icon: Icon } = item;
  const active = isItemActive(pathname, item);

  return (
    <Link
      href={href}
      onClick={onNavigate}
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
}

/**
 * Sidebar body (brand, section nav, footer). Rendered inside the static desktop
 * `<aside>` and inside the mobile slide-in `Sheet`. `onNavigate` lets the mobile
 * drawer close itself when a link is followed.
 */
function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { can } = useAuth();
  const visibleSections = getVisibleSections(can);

  const [collapsed, setCollapsed] = useState<CollapsedMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(readCollapsedMap());
    setHydrated(true);
  }, []);

  // Auto-expand the section that contains the active route on navigation only.
  useEffect(() => {
    if (!hydrated) return;
    const activeSectionId = findActiveSectionId(
      getVisibleSections(can),
      pathname,
    );
    if (!activeSectionId) return;

    setCollapsed((prev) => {
      if (!prev[activeSectionId]) return prev;
      const next = { ...prev, [activeSectionId]: false };
      writeCollapsedMap(next);
      return next;
    });
  }, [pathname, hydrated, can]);

  function toggleSection(sectionId: string) {
    setCollapsed((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      writeCollapsedMap(next);
      return next;
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-4 py-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-display text-lg font-semibold tracking-tight text-sidebar-foreground"
        >
          QTO ERP
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {visibleSections.map((section) => {
          const isCollapsed = Boolean(collapsed[section.id]);
          const expanded = !isCollapsed;

          return (
            <div key={section.id} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-semibold tracking-wide text-sidebar-foreground/50 uppercase hover:text-sidebar-foreground/80"
              >
                <span>{section.label}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 transition-transform",
                    isCollapsed && "-rotate-90",
                  )}
                  aria-hidden
                />
              </button>

              {expanded ? (
                section.groups?.length ? (
                  <div className="flex flex-col gap-2">
                    {section.groups.map((group) => (
                      <div key={group.id} className="flex flex-col gap-0.5">
                        <div className="px-3 pt-1 text-xs font-medium text-sidebar-foreground/45">
                          {group.label}
                        </div>
                        <div className="flex flex-col gap-0.5 border-l border-sidebar-border/60 ml-3 pl-1">
                          {group.items.map((item) => (
                            <NavLinkItem
                              key={item.href}
                              item={item}
                              pathname={pathname}
                              onNavigate={onNavigate}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  (section.items ?? []).map((item) => (
                    <NavLinkItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onNavigate={onNavigate}
                    />
                  ))
                )
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ExternalLink className="size-4 shrink-0" />
          View site
        </a>
      </div>
    </div>
  );
}

/** Static sidebar column — visible from the `lg` breakpoint up. */
export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <AdminSidebarNav />
    </aside>
  );
}

/** Slide-in sidebar drawer for narrow screens (below `lg`). */
export function AdminMobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  // Close the drawer whenever the route changes (covers breadcrumb / in-page links).
  useEffect(() => {
    onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close the drawer if the viewport grows to the desktop breakpoint, where the
  // static sidebar takes over (avoids a stranded overlay after a resize).
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handle = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) onOpenChange(false);
    };
    handle(mql);
    mql.addEventListener("change", handle);
    return () => mql.removeEventListener("change", handle);
  }, [onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-72 border-sidebar-border bg-sidebar p-0 lg:hidden"
      >
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <AdminSidebarNav onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
