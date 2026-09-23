import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  Phone,
  Boxes,
  Layers,
  FileText,
  Video,
  Settings2,
  Link2,
  Sparkles,
  BadgeCheck,
  BarChart3,
  HardHat,
  Factory,
  CircleHelp,
  Bot,
  Megaphone,
  PanelBottom,
  CalendarCheck,
  LayoutTemplate,
  Building2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Capability } from "@/lib/permission-matrix";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** When set, nav item is shown only if the user has this capability. */
  capability?: Capability;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export type AdminNavSection = {
  id: string;
  label: string;
  /** Flat links (Overview, Leads, Site config, Administration). */
  items?: AdminNavItem[];
  /** Page-grouped links (Site content). Prefer groups when present. */
  groups?: AdminNavGroup[];
};

function filterNavItems(
  items: AdminNavItem[],
  can: (capability: Capability) => boolean,
): AdminNavItem[] {
  return items.filter((item) => !item.capability || can(item.capability));
}

function sectionNavItems(section: AdminNavSection): AdminNavItem[] {
  if (section.groups?.length) {
    return section.groups.flatMap((group) => group.items);
  }
  return section.items ?? [];
}

/** Flatten a section's links whether it uses `groups` or flat `items`. */
export function getSectionNavItems(section: AdminNavSection): AdminNavItem[] {
  return sectionNavItems(section);
}

export const adminNavSections: AdminNavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    id: "leads",
    label: "Leads",
    items: [
      {
        href: "/admin/demo-requests",
        label: "Demo requests",
        icon: MessageSquare,
      },
      {
        href: "/admin/contact-inquiries",
        label: "Contact inquiries",
        icon: Mail,
      },
    ],
  },
  {
    id: "site-content",
    label: "Site content",
    groups: [
      {
        id: "home",
        label: "Home",
        items: [
          { href: "/admin/home-hero", label: "Home hero", icon: Sparkles },
          {
            href: "/admin/trusted-logos",
            label: "Trusted logos",
            icon: BadgeCheck,
          },
          { href: "/admin/home-stats", label: "Home stats", icon: BarChart3 },
          { href: "/admin/built-for", label: "Built for", icon: HardHat },
          {
            href: "/admin/industry-domains",
            label: "Industry domains",
            icon: Factory,
          },
          { href: "/admin/home-cta", label: "Home CTA", icon: Megaphone },
        ],
      },
      {
        id: "modules",
        label: "Modules",
        items: [
          { href: "/admin/modules", label: "Modules", icon: Boxes },
          { href: "/admin/demo-videos", label: "Demo videos", icon: Video },
        ],
      },
      {
        id: "solutions",
        label: "Solutions",
        items: [
          { href: "/admin/solutions", label: "Solutions", icon: Layers },
        ],
      },
      {
        id: "demo",
        label: "Demo",
        items: [
          {
            href: "/admin/demo-page",
            label: "Demo page",
            icon: CalendarCheck,
          },
        ],
      },
      {
        id: "about",
        label: "About",
        items: [
          { href: "/admin/about", label: "About page", icon: Building2 },
        ],
      },
      {
        id: "blog",
        label: "Blog",
        items: [{ href: "/admin/blog", label: "Blog", icon: FileText }],
      },
      {
        id: "shared",
        label: "Shared",
        items: [
          { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
          {
            href: "/admin/chatbot-knowledge",
            label: "Chatbot knowledge",
            icon: Bot,
          },
          {
            href: "/admin/page-hero",
            label: "Page heroes",
            icon: LayoutTemplate,
          },
        ],
      },
    ],
  },
  {
    id: "site-config",
    label: "Site configuration",
    items: [
      {
        href: "/admin/site-settings",
        label: "Site settings",
        icon: Settings2,
        capability: "settings:edit",
      },
      {
        href: "/admin/footer",
        label: "Footer",
        icon: PanelBottom,
        capability: "settings:edit",
      },
      {
        href: "/admin/nav-resources",
        label: "Nav resources",
        icon: Link2,
        capability: "settings:edit",
      },
      { href: "/admin/contact", label: "Contact page", icon: Phone },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        href: "/admin/users",
        label: "Users",
        icon: Users,
        capability: "users:manage",
      },
    ],
  },
];

/** Flat list derived from sections (for any consumers that need it). */
export const adminNavItems: AdminNavItem[] = adminNavSections.flatMap(
  (section) => sectionNavItems(section),
);

export function getVisibleSections(
  can: (capability: Capability) => boolean,
): AdminNavSection[] {
  return adminNavSections
    .map((section) => {
      if (section.groups?.length) {
        const groups = section.groups
          .map((group) => ({
            ...group,
            items: filterNavItems(group.items, can),
          }))
          .filter((group) => group.items.length > 0);
        return { ...section, groups, items: undefined };
      }

      return {
        ...section,
        items: filterNavItems(section.items ?? [], can),
        groups: undefined,
      };
    })
    .filter((section) => {
      if (section.groups?.length) return true;
      return (section.items?.length ?? 0) > 0;
    });
}

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

const breadcrumbRoutes: Array<{
  pattern: RegExp;
  crumbs: BreadcrumbSegment[];
}> = [
  {
    pattern: /^\/admin\/blog\/[^/]+\/edit$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Blog", href: "/admin/blog" },
      { label: "Edit post" },
    ],
  },
  {
    pattern: /^\/admin\/blog\/new$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Blog", href: "/admin/blog" },
      { label: "New post" },
    ],
  },
  {
    pattern: /^\/admin\/demo-requests$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Demo requests" },
    ],
  },
  {
    pattern: /^\/admin\/contact-inquiries$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Contact inquiries" },
    ],
  },
  {
    pattern: /^\/admin\/contact$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Contact page" },
    ],
  },
  {
    pattern: /^\/admin\/modules$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Modules" }],
  },
  {
    pattern: /^\/admin\/modules\/new$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Modules", href: "/admin/modules" },
      { label: "New module" },
    ],
  },
  {
    pattern: /^\/admin\/modules\/[^/]+\/edit(?:\/[^/]+)?$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Modules", href: "/admin/modules" },
      { label: "Edit module" },
    ],
  },
  {
    pattern: /^\/admin\/solutions$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Solutions" }],
  },
  {
    pattern: /^\/admin\/solutions\/new$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Solutions", href: "/admin/solutions" },
      { label: "New solution" },
    ],
  },
  {
    pattern: /^\/admin\/solutions\/[^/]+\/edit(?:\/[^/]+)?$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Solutions", href: "/admin/solutions" },
      { label: "Edit solution" },
    ],
  },
  {
    pattern: /^\/admin\/blog$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Blog" }],
  },
  {
    pattern: /^\/admin\/page-hero$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Page heroes" },
    ],
  },
  {
    pattern: /^\/admin\/about$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "About page" }],
  },
  {
    pattern: /^\/admin\/demo-videos$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Demo videos" },
    ],
  },
  {
    pattern: /^\/admin\/demo-page$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Demo page" },
    ],
  },
  {
    pattern: /^\/admin\/site-settings$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Site settings" },
    ],
  },
  {
    pattern: /^\/admin\/home-hero$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Home hero" },
    ],
  },
  {
    pattern: /^\/admin\/trusted-logos$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Trusted logos" },
    ],
  },
  {
    pattern: /^\/admin\/home-stats$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Home stats" },
    ],
  },
  {
    pattern: /^\/admin\/built-for$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Built for" },
    ],
  },
  {
    pattern: /^\/admin\/industry-domains$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Industry domains" },
    ],
  },
  {
    pattern: /^\/admin\/faqs$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "FAQs" }],
  },
  {
    pattern: /^\/admin\/chatbot-knowledge$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Chatbot knowledge" },
    ],
  },
  {
    pattern: /^\/admin\/home-cta$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Home CTA" }],
  },
  {
    pattern: /^\/admin\/footer$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Footer" }],
  },
  {
    pattern: /^\/admin\/nav-resources$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Nav resources" },
    ],
  },
  {
    pattern: /^\/admin\/users$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Users" }],
  },
  {
    pattern: /^\/admin\/profile$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Profile" }],
  },
  {
    pattern: /^\/admin$/,
    crumbs: [{ label: "QTO ERP" }],
  },
];

function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function resolveBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  for (const route of breadcrumbRoutes) {
    if (route.pattern.test(pathname)) {
      return route.crumbs;
    }
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return [{ label: "QTO ERP" }];
  }

  const lastSegment = segments.at(-1);
  return [
    { label: "QTO ERP", href: "/admin" },
    { label: lastSegment ? humanizeSegment(lastSegment) : "Admin" },
  ];
}
