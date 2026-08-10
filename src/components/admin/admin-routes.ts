import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  Phone,
  Boxes,
  Layers,
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
  Factory,
  CircleHelp,
  Megaphone,
  PanelBottom,
  CalendarCheck,
  Tags,
  LayoutTemplate,
  Building2,
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
  {
    href: "/admin/contact-inquiries",
    label: "Contact inquiries",
    icon: Mail,
  },
  { href: "/admin/contact", label: "Contact page", icon: Phone },
  { href: "/admin/modules", label: "Modules", icon: Boxes },
  { href: "/admin/solutions", label: "Solutions", icon: Layers },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  {
    href: "/admin/page-hero",
    label: "Page heroes",
    icon: LayoutTemplate,
  },
  { href: "/admin/about", label: "About page", icon: Building2 },
  { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
  { href: "/admin/pricing-page", label: "Pricing page", icon: Tags },
  { href: "/admin/demo-videos", label: "Demo videos", icon: Video },
  { href: "/admin/demo-page", label: "Demo page", icon: CalendarCheck },
  { href: "/admin/comparison", label: "Comparison", icon: Table2 },
  { href: "/admin/home-hero", label: "Home hero", icon: Sparkles },
  { href: "/admin/trusted-logos", label: "Trusted logos", icon: BadgeCheck },
  { href: "/admin/home-stats", label: "Home stats", icon: BarChart3 },
  { href: "/admin/built-for", label: "Built for", icon: HardHat },
  {
    href: "/admin/industry-domains",
    label: "Industry domains",
    icon: Factory,
  },
  { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
  { href: "/admin/home-cta", label: "Home CTA", icon: Megaphone },
  { href: "/admin/footer", label: "Footer", icon: PanelBottom },
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
    pattern: /^\/admin\/modules\/[^/]+\/edit$/,
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
    pattern: /^\/admin\/solutions\/[^/]+\/edit$/,
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
    pattern: /^\/admin\/pricing$/,
    crumbs: [{ label: "QTO ERP", href: "/admin" }, { label: "Pricing" }],
  },
  {
    pattern: /^\/admin\/pricing-page$/,
    crumbs: [
      { label: "QTO ERP", href: "/admin" },
      { label: "Pricing page" },
    ],
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
