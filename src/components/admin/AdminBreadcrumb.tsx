"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { resolveBreadcrumbs } from "@/components/admin/admin-routes";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const crumbs = resolveBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li
              key={`${crumb.label}-${index}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 ? (
                <span className="text-muted-foreground" aria-hidden>
                  /
                </span>
              ) : null}
              {isLast || !crumb.href ? (
                <span
                  className={
                    isLast
                      ? "truncate font-medium text-foreground"
                      : "text-muted-foreground"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
