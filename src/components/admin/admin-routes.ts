import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  DollarSign,
  Video,
  Table2,
  Settings2,
  Link2,
  Sparkles,
  BadgeCheck,
  BarChart3,
  HardHat,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
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
  { href: "/admin/home-hero", label: "Home hero", icon: Sparkles },
  { href: "/admin/trusted-logos", label: "Trusted logos", icon: BadgeCheck },
  { href: "/admin/home-stats", label: "Home stats", icon: BarChart3 },
  { href: "/admin/built-for", label: "Built for", icon: HardHat },
  { href: "/admin/site-settings", label: "Site settings", icon: Settings2 },
  { href: "/admin/nav-resources", label: "Nav resources", icon: Link2 },
];

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
    pattern: /^\/admin\/pricing\/[^/]+\/edit$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Pricing", href: "/admin/pricing" },
      { label: "Edit plan" },
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
    pattern: /^\/admin\/blog$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Blog" }],
  },
  {
    pattern: /^\/admin\/pricing$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Pricing" }],
  },
  {
    pattern: /^\/admin\/demo-videos$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Demo videos" },
    ],
  },
  {
    pattern: /^\/admin\/comparison$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Comparison" }],
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
    pattern: /^\/admin\/nav-resources$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Nav resources" },
    ],
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
