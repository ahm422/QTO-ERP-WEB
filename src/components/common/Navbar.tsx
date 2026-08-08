"use client";

import { useState, useRef, useMemo } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Briefcase,
  TrendingUp,
  BookOpen,
  Info,
  Mail,
  Clock,
  Building2,
  DollarSign,
  FolderKanban,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MarketingButton } from "@/components/ui/marketing-button";
import { platformDeepLinks } from "@/lib/platform-nav";
import { getModuleIcon } from "@/lib/icon-map";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QTO_DEV_URL } from "@/lib/constants";
import type { ModuleDetail, SolutionDetail } from "@/types/content";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { getButtonTap } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Module-token tint cycle for nav app tiles
const navAppColors = [
  {
    color: "from-module-hr to-module-crm",
    bgColor: "bg-module-hr-bg",
    textColor: "text-module-hr",
  },
  {
    color: "from-module-inventory to-module-mfg",
    bgColor: "bg-module-inventory-bg",
    textColor: "text-module-inventory",
  },
  {
    color: "from-module-crm to-module-payroll",
    bgColor: "bg-module-crm-bg",
    textColor: "text-module-crm",
  },
  {
    color: "from-accent to-accent-dark",
    bgColor: "bg-accent/10",
    textColor: "text-accent",
  },
];

const sectionLinks = platformDeepLinks;

function buildNavApps(modules: ModuleDetail[]) {
  return modules.map((app, idx) => ({
    slug: app.slug,
    name: app.name,
    icon: getModuleIcon(app.iconKey),
    description: app.shortDescription,
    features: app.features.slice(0, 6).map((f) => ({
      label: f.title,
      description: f.description,
    })),
    ...navAppColors[idx % navAppColors.length],
  }));
}

const navItems = [
  { label: "Platform", href: "/allApps", hasMega: true },
  { label: "Solutions", href: "#", hasDropdown: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "#", hasDropdown: true },
];

function buildSolutionsItems(
  solutions: SolutionDetail[],
  modules: ModuleDetail[],
) {
  const solutionUseCases = (slug: string) =>
    solutions.find((s) => s.slug === slug)?.useCases ?? [];
  const moduleUseCases = (slug: string) =>
    modules.find((m) => m.slug === slug)?.useCases ?? [];

  return [
    {
      slug: "hr-teams",
      label: "Attendance",
      href: "/solution/hr-teams",
      shortDescription: "Streamline people operations",
      description:
        "Centralize HR workflows with attendance tracking, performance management, and compliance.",
      icon: Clock,
      color: "from-module-hr to-module-crm",
      bgColor: "bg-module-hr-bg",
      textColor: "text-module-hr",
      useCases: solutionUseCases("hr-teams"),
    },
    {
      slug: "project-teams",
      label: "HRMS",
      href: "/solution/project-teams",
      shortDescription: "Deliver projects on time",
      description:
        "Manage projects end-to-end with planning, tracking, and resource allocation tools.",
      icon: Briefcase,
      color: "from-module-inventory to-module-mfg",
      bgColor: "bg-module-inventory-bg",
      textColor: "text-module-inventory",
      useCases: solutionUseCases("project-teams"),
    },
    {
      slug: "business-owners",
      label: "PM",
      href: "/solution/owners",
      shortDescription: "Scale with confidence",
      description:
        "Unified platform for operations, people, projects, and financials across your organization.",
      icon: TrendingUp,
      color: "from-module-crm to-module-payroll",
      bgColor: "bg-module-crm-bg",
      textColor: "text-module-crm",
      useCases: solutionUseCases("owners"),
    },
    {
      slug: "crms",
      label: "CRM",
      href: "/erp/crms",
      shortDescription: "Track leads and manage deals",
      description:
        "Manage leads, generate proposals, estimate projects, and track deals from inquiry to completion.",
      icon: Building2,
      color: "from-accent to-accent-dark",
      bgColor: "bg-accent/10",
      textColor: "text-accent",
      useCases: moduleUseCases("crms"),
    },
    {
      slug: "salary",
      label: "Salary",
      href: "/erp/salary",
      shortDescription: "Automate payroll (Coming Soon)",
      description:
        "Automate payroll processing, manage salary structures, and streamline approvals seamlessly.",
      icon: DollarSign,
      color: "from-module-payroll to-accent",
      bgColor: "bg-module-payroll-bg",
      textColor: "text-module-payroll",
      useCases: moduleUseCases("salary"),
    },
    {
      slug: "finance",
      label: "Finance",
      href: "/erp/finance",
      shortDescription: "Manage finances (Coming Soon)",
      description:
        "Track accounts, manage budgets, and generate financial reports efficiently.",
      icon: FolderKanban,
      color: "from-module-accounting to-module-hr",
      bgColor: "bg-module-accounting-bg",
      textColor: "text-module-accounting",
      useCases: moduleUseCases("finance"),
    },
  ];
}

type PublicNavResource = {
  id: string;
  label: string;
  href: string;
  iconKey: string;
  subtitle: string | null;
  external: boolean;
};

const NAV_RESOURCE_ICON_MAP: Record<string, LucideIcon> = {
  newspaper:       BookOpen,
  info:            Info,
  mail:            Mail,
  code:            ExternalLink,
  link:            ExternalLink,
  "external-link": ExternalLink,
};

function getNavResourceIcon(key: string): LucideIcon {
  return NAV_RESOURCE_ICON_MAP[key] ?? BookOpen;
}

const navResourceColors = [
  { color: "from-module-hr to-module-crm", textColor: "text-module-hr" },
  { color: "from-accent to-accent-dark", textColor: "text-accent" },
  { color: "from-module-mfg to-module-payroll", textColor: "text-module-mfg" },
  { color: "from-module-crm to-module-inventory", textColor: "text-module-crm" },
];

const resourcesItems = [
  {
    label: "Blog",
    href: "/blog",
    description: "Latest updates",
    icon: BookOpen,
    color: "from-module-hr to-module-crm",
    textColor: "text-module-hr",
  },
  {
    label: "About Us",
    href: "/about",
    description: "Learn more",
    icon: Info,
    color: "from-accent to-accent-dark",
    textColor: "text-accent",
  },
  {
    label: "Contact Us",
    href: "/contact",
    description: "Get in touch",
    icon: Mail,
    color: "from-accent to-accent-dark",
    textColor: "text-accent",
  },
  {
    label: "QTO Dev",
    href: QTO_DEV_URL,
    external: true,
    description: "Web development partner",
    icon: ExternalLink,
    color: "from-module-mfg to-module-payroll",
    textColor: "text-module-mfg",
  },
];

type NavbarProps = {
  modules: ModuleDetail[];
  solutions: SolutionDetail[];
  siteName?: string;
  logoUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaVisible?: boolean;
  navResources?: PublicNavResource[];
};

export default function NavbarV3({
  modules,
  solutions,
  siteName,
  logoUrl,
  ctaLabel,
  ctaUrl,
  ctaVisible = true,
  navResources,
}: NavbarProps) {
  const apps = useMemo(() => buildNavApps(modules), [modules]);
  const solutionsItems = useMemo(
    () => buildSolutionsItems(solutions, modules),
    [solutions, modules],
  );
  const resourceItems = useMemo(
    () =>
      navResources && navResources.length > 0
        ? navResources.map((r, idx) => ({
            ...r,
            description: r.subtitle,
            icon: getNavResourceIcon(r.iconKey),
            ...navResourceColors[idx % navResourceColors.length],
          }))
        : resourcesItems,
    [navResources],
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string>(modules[0]?.slug ?? "");
  const [hoveredSolution, setHoveredSolution] = useState<string>(
    "hr-teams",
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const navItemHover = reduced ? undefined : { x: 3 };
  const navItemTap = getButtonTap(reduced);
  const resourceItemVariants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 } };
  const mobileItemVariants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } };
  const megaMenuVariants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.97 },
      };
  const listItemVariants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };
  const mobileDrawerVariants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
      };

  // Close overlays when the route changes (adjust state during render)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setActiveDropdown(null);
  }

  const openDropdown = (label: string) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const closeDropdown = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setHoveredApp(apps[0]?.slug);
    }, 200);
  };

  const currentApp = apps.find((a) => a.slug === hoveredApp) || apps[0];
  const currentSol =
    solutionsItems.find((s) => s.slug === hoveredSolution) || solutionsItems[0];

  /** Refined floating glass — warm brand rim, not chunky chrome */
  const barShell = cn(
    "relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3",
    "rounded-2xl border border-border/50 bg-background/70 px-3 sm:h-[3.75rem] sm:px-4 lg:px-5",
    "shadow-[0_12px_40px_-18px_color-mix(in_oklab,var(--foreground)_28%,transparent)]",
    "ring-1 ring-inset ring-white/40 backdrop-blur-xl",
    "dark:border-white/10 dark:bg-card/55 dark:ring-white/8",
    "before:pointer-events-none before:absolute before:inset-x-8 before:-top-px before:h-px",
    "before:bg-linear-to-r before:from-transparent before:via-accent/50 before:to-transparent",
  );

  const desktopTriggerBase = cn(
    "group relative inline-flex items-center gap-1 rounded-full px-3.5 py-2",
    "text-[13px] font-medium tracking-tight transition-colors duration-200",
  );
  const desktopTriggerInactive =
    "text-muted-foreground hover:text-foreground";
  const desktopTriggerActive =
    "bg-accent/10 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_28%,transparent)]";

  const desktopMenuShell = cn(
    "overflow-hidden rounded-2xl border border-border/50 bg-background/92",
    "shadow-[0_28px_80px_-28px_color-mix(in_oklab,var(--foreground)_45%,transparent),0_0_0_1px_color-mix(in_oklab,var(--accent)_12%,transparent)]",
    "backdrop-blur-2xl dark:bg-card/92 dark:border-white/10",
  );

  const desktopSectionCard = cn(
    "group relative block overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-4",
    "transition-all duration-200 hover:border-accent/35 hover:bg-background hover:shadow-[0_10px_30px_-16px_color-mix(in_oklab,var(--accent)_35%,transparent)]",
  );

  const mobileSurface = cn(
    "border border-border/50 bg-background/95 shadow-[0_32px_90px_-30px_color-mix(in_oklab,var(--foreground)_55%,transparent)]",
    "backdrop-blur-2xl dark:bg-card/95 dark:border-white/10",
  );

  const sidebarItem = (isActive: boolean, bgColor: string) =>
    cn(
      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
      isActive
        ? `${bgColor} shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--border)_80%,transparent)]`
        : "hover:bg-background/80",
    );

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
      {/* Soft page-edge fade under the floating bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-background/80 via-background/40 to-transparent"
      />

      <nav className={barShell} aria-label="Primary">
        {/* Logo */}
        <Link
          href="/"
          className="group relative z-10 flex shrink-0 items-center gap-2.5"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName ?? "QTO-ERP"}
              className="h-8 w-auto object-contain sm:h-9"
            />
          ) : (
            <>
              <span className="relative flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-accent to-accent-dark shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--accent)_70%,transparent)] transition-transform duration-300 group-hover:scale-105 sm:size-9">
                <Sparkles className="size-3.5 text-accent-foreground sm:size-4" />
                <span className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-t from-transparent to-white/25 opacity-60" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
                <span className="bg-linear-to-r from-accent to-accent-dark bg-clip-text text-transparent">
                  {(siteName ?? "QTO-ERP").split("-")[0]}
                </span>
                <span className="text-foreground">
                  {(siteName ?? "QTO-ERP").includes("-")
                    ? `-${(siteName ?? "QTO-ERP").split("-").slice(1).join("-")}`
                    : ""}
                </span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav — open links, not nested pill trays */}
        <ul className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() =>
                (item.hasMega || item.hasDropdown) && openDropdown(item.label)
              }
              onMouseLeave={closeDropdown}
            >
              {item.hasMega || item.hasDropdown ? (
                <button
                  type="button"
                  aria-expanded={activeDropdown === item.label}
                  className={cn(
                    desktopTriggerBase,
                    activeDropdown === item.label
                      ? desktopTriggerActive
                      : desktopTriggerInactive,
                  )}
                >
                  {item.label}
                  <motion.span
                    animate={
                      reduced
                        ? undefined
                        : {
                            rotate: activeDropdown === item.label ? 180 : 0,
                          }
                    }
                    transition={{ duration: 0.2 }}
                    className="inline-flex"
                    style={
                      reduced
                        ? {
                            transform: `rotate(${
                              activeDropdown === item.label ? 180 : 0
                            }deg)`,
                          }
                        : undefined
                    }
                  >
                    <ChevronDown className="size-3.5 opacity-70" />
                  </motion.span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    desktopTriggerBase,
                    desktopTriggerInactive,
                    pathname === item.href &&
                      "bg-accent/10 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_28%,transparent)]",
                  )}
                >
                  {item.label}
                </Link>
              )}

              {/* Platform Mega Menu */}
              <AnimatePresence>
                {item.label === "Platform" && activeDropdown === "Platform" && (
                  <motion.div
                    variants={megaMenuVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      duration: 0.22,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="fixed left-1/2 top-[4.35rem] z-50 w-[min(52rem,calc(100vw-1.5rem))] -translate-x-1/2 pt-3 xl:w-[54rem]"
                    onMouseEnter={() => openDropdown("Platform")}
                    onMouseLeave={closeDropdown}
                  >
                    <div className={desktopMenuShell}>
                      <div className="h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />

                      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
                        {/* Apps Sidebar */}
                        <div className="border-b border-border/50 bg-muted/25 p-4 md:border-b-0 md:border-r md:p-5">
                          <p className="mb-3 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-accent" />
                            Platforms
                          </p>
                          <div className="space-y-0.5">
                            {apps.map((app) => {
                              const Icon = app.icon;
                              const isActive = hoveredApp === app.slug;
                              return (
                                <motion.button
                                  key={app.slug}
                                  type="button"
                                  onMouseEnter={() => setHoveredApp(app.slug)}
                                  whileHover={navItemHover}
                                  whileTap={navItemTap}
                                  className={sidebarItem(isActive, app.bgColor)}
                                >
                                  <div
                                    className={cn(
                                      "flex size-8 items-center justify-center rounded-lg transition-all duration-200",
                                      isActive
                                        ? `bg-linear-to-br ${app.color} text-white shadow-md`
                                        : "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    <Icon className="size-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={cn(
                                        "truncate text-sm font-semibold transition-colors",
                                        isActive
                                          ? app.textColor
                                          : "text-foreground/85",
                                      )}
                                    >
                                      {app.name}
                                    </p>
                                  </div>
                                  <ArrowRight
                                    className={cn(
                                      "size-3.5 transition-all duration-200",
                                      isActive
                                        ? `translate-x-0 opacity-100 ${app.textColor}`
                                        : "-translate-x-1 opacity-0",
                                    )}
                                  />
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sections Grid */}
                        <div className="relative overflow-hidden p-5 sm:p-6">
                          <div
                            className={`pointer-events-none absolute -right-8 -top-10 size-56 rounded-full bg-linear-to-br ${currentApp?.color} opacity-[0.12] blur-3xl`}
                          />

                          <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex size-10 items-center justify-center rounded-xl bg-linear-to-br ${currentApp?.color} text-white shadow-lg`}
                              >
                                {currentApp?.icon && (
                                  <currentApp.icon className="size-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-display text-sm font-bold text-foreground">
                                  {currentApp?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {currentApp?.features.length} features
                                </p>
                              </div>
                            </div>
                            <Link
                              href={`/erp/${currentApp?.slug}`}
                              onClick={() => setActiveDropdown(null)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted",
                                currentApp?.textColor,
                              )}
                            >
                              View module <ArrowRight className="size-3" />
                            </Link>
                          </div>

                          <div className="relative z-10 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {/* sync (not wait): multiple grid cards must animate together */}
                            <AnimatePresence initial={false}>
                              {sectionLinks.map((links, idx) => (
                                <motion.div
                                  key={`${hoveredApp}-${links.label}`}
                                  variants={listItemVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  transition={{
                                    delay: idx * 0.03,
                                    duration: 0.15,
                                  }}
                                >
                                  <Link
                                    href={`/erp/${currentApp?.slug}${links.anchor}`}
                                    onClick={() => setActiveDropdown(null)}
                                    className={desktopSectionCard}
                                  >
                                    <p className="text-sm font-semibold text-foreground">
                                      {links.label}
                                    </p>
                                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-accent">
                                      Open{" "}
                                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                  </Link>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col gap-3 border-t border-border/50 bg-muted/20 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {apps.slice(0, 4).map((app) => (
                              <div
                                key={app.slug}
                                className={`flex size-7 items-center justify-center rounded-full border-2 border-background bg-linear-to-br ${app.color} text-white`}
                              >
                                <app.icon className="size-3" />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {apps.length}+ modules
                            </span>{" "}
                            to power your business
                          </p>
                        </div>
                        <Link
                          href="/allApps"
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-all hover:border-accent/40 hover:text-accent"
                        >
                          Explore all <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Solutions Dropdown - Mega Menu */}
                {item.label === "Solutions" &&
                  activeDropdown === "Solutions" && (
                    <motion.div
                      variants={megaMenuVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{
                        duration: 0.22,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="fixed left-1/2 top-[4.35rem] z-50 w-[min(46rem,calc(100vw-1.5rem))] -translate-x-1/2 pt-3 xl:w-[48rem]"
                      onMouseEnter={() => openDropdown("Solutions")}
                      onMouseLeave={closeDropdown}
                    >
                      <div className={desktopMenuShell}>
                        <div className="h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />

                        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
                          <div className="border-b border-border/50 bg-muted/25 p-4 md:border-b-0 md:border-r md:p-5">
                            <p className="mb-3 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                              <span className="size-1.5 rounded-full bg-accent" />
                              Solutions
                            </p>
                            <div className="space-y-0.5">
                              {solutionsItems.map((sol) => {
                                const Icon = sol.icon;
                                const isActive = hoveredSolution === sol.slug;
                                return (
                                  <motion.button
                                    key={sol.slug}
                                    type="button"
                                    onMouseEnter={() =>
                                      setHoveredSolution(sol.slug)
                                    }
                                    whileHover={navItemHover}
                                    whileTap={navItemTap}
                                    className={sidebarItem(isActive, sol.bgColor)}
                                  >
                                    <div
                                      className={cn(
                                        "flex size-8 items-center justify-center rounded-lg transition-all duration-200",
                                        isActive
                                          ? `bg-linear-to-br ${sol.color} text-white shadow-md`
                                          : "bg-muted text-muted-foreground",
                                      )}
                                    >
                                      <Icon className="size-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className={cn(
                                          "truncate text-sm font-semibold transition-colors",
                                          isActive
                                            ? sol.textColor
                                            : "text-foreground/85",
                                        )}
                                      >
                                        {sol.label}
                                      </p>
                                    </div>
                                    <ArrowRight
                                      className={cn(
                                        "size-3.5 transition-all duration-200",
                                        isActive
                                          ? `translate-x-0 opacity-100 ${sol.textColor}`
                                          : "-translate-x-1 opacity-0",
                                      )}
                                    />
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="relative overflow-hidden p-5 sm:p-6">
                            <div
                              className={`pointer-events-none absolute -right-8 -top-10 size-56 rounded-full bg-linear-to-br ${currentSol.color} opacity-[0.12] blur-3xl transition-all duration-300`}
                            />

                            <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex size-10 items-center justify-center rounded-xl bg-linear-to-br ${currentSol.color} text-white shadow-lg`}
                                >
                                  <currentSol.icon className="size-5" />
                                </div>
                                <div>
                                  <p className="font-display text-sm font-bold text-foreground">
                                    {currentSol.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {currentSol.useCases?.length ?? 0} use cases
                                  </p>
                                </div>
                              </div>
                              <Link
                                href={currentSol.href}
                                onClick={() => setActiveDropdown(null)}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted",
                                  currentSol.textColor,
                                )}
                              >
                                Explore <ArrowRight className="size-3" />
                              </Link>
                            </div>

                            <div className="relative z-10 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                              {/* sync (not wait): multiple use-case cards must animate together */}
                              <AnimatePresence initial={false}>
                                {(currentSol.useCases &&
                                currentSol.useCases.length > 0
                                  ? currentSol.useCases
                                  : []
                                ).map((useCase, idx) => (
                                  <motion.div
                                    key={`${hoveredSolution}-${idx}`}
                                    variants={listItemVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{
                                      delay: idx * 0.04,
                                      duration: 0.15,
                                    }}
                                  >
                                    <Link
                                      href={currentSol.href}
                                      onClick={() => setActiveDropdown(null)}
                                      className={cn(desktopSectionCard, "h-full")}
                                    >
                                      <p className="text-sm font-semibold text-foreground">
                                        {"industry" in useCase
                                          ? useCase.industry
                                          : "title" in useCase
                                            ? useCase.title
                                            : "Use Case"}
                                      </p>
                                    </Link>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-border/50 bg-muted/20 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {solutionsItems.slice(0, 5).map((sol) => {
                                const Icon = sol.icon;
                                return (
                                  <div
                                    key={sol.slug}
                                    className={`flex size-7 items-center justify-center rounded-full border-2 border-background bg-linear-to-br ${sol.color} text-white`}
                                  >
                                    <Icon className="size-3" />
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                {solutionsItems.length} solutions
                              </span>{" "}
                              for every team
                            </p>
                          </div>
                          <Link
                            href="/allApps"
                            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-all hover:border-accent/40 hover:text-accent"
                          >
                            Explore all <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}

                {/* Resources Dropdown */}
                {item.label === "Resources" &&
                  activeDropdown === "Resources" && (
                    <motion.div
                      variants={megaMenuVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full z-50 pt-3"
                      onMouseEnter={() => openDropdown("Resources")}
                      onMouseLeave={closeDropdown}
                    >
                      <div className={cn(desktopMenuShell, "w-[min(20rem,calc(100vw-2rem))] p-2")}>
                        <div className="mb-1.5 h-px rounded-full bg-linear-to-r from-transparent via-accent/50 to-transparent" />
                        {resourceItems.map((r, idx) => {
                          const Icon = r.icon;
                          const rowClass =
                            "group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-muted/50";
                          const body = (
                            <>
                              <div
                                className={`flex size-9 items-center justify-center rounded-lg bg-linear-to-br ${r.color} text-white shadow-md transition-transform group-hover:scale-105`}
                              >
                                <Icon className="size-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                  {r.label}
                                </p>
                                {r.description && (
                                  <p className="truncate text-xs text-muted-foreground">
                                    {r.description}
                                  </p>
                                )}
                              </div>
                              <ArrowRight className="size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
                            </>
                          );
                          return r.external ? (
                            <motion.a
                              key={r.href}
                              href={r.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={resourceItemVariants.initial}
                              animate={resourceItemVariants.animate}
                              transition={{
                                delay: reduced ? 0 : idx * 0.04,
                              }}
                              className={rowClass}
                            >
                              {body}
                            </motion.a>
                          ) : (
                            <motion.div
                              key={r.href}
                              initial={resourceItemVariants.initial}
                              animate={resourceItemVariants.animate}
                              transition={{
                                delay: reduced ? 0 : idx * 0.04,
                              }}
                            >
                              <Link href={r.href} className={rowClass}>
                                {body}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        {/* Right side — desktop */}
        <div className="relative z-10 hidden items-center gap-1.5 lg:flex">
          <ThemeToggle />
          {ctaVisible && (
            <MarketingButton
              variant="primary"
              size="sm"
              asChild
              className="rounded-full px-4 shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--accent)_55%,transparent)]"
            >
              <Link href={ctaUrl ?? "/demo"}>{ctaLabel ?? "Book Demo"}</Link>
            </MarketingButton>
          )}
        </div>

        {/* Mobile controls */}
        <div className="relative z-10 flex items-center gap-0.5 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full transition-colors",
              "text-foreground hover:bg-muted",
              mobileOpen && "bg-accent/10 text-accent",
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              variants={mobileDrawerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 top-[4.75rem] z-40 px-3 pb-3 lg:hidden sm:px-4"
            >
              <div
                className={cn(
                  "relative flex h-full max-h-full flex-col overflow-hidden rounded-2xl",
                  mobileSurface,
                )}
              >
                <div className="absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-accent/45 to-transparent" />
                <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-3 sm:p-4">
                  <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Platforms
                  </p>
                  {apps.map((app, idx) => {
                    const Icon = app.icon;
                    return (
                      <motion.div
                        key={app.slug}
                        initial={mobileItemVariants.initial}
                        animate={mobileItemVariants.animate}
                        transition={{ delay: reduced ? 0 : idx * 0.04 }}
                      >
                        <Link
                          href={`/erp/${app.slug}`}
                          className="group flex items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-muted/60"
                        >
                          <div
                            className={`flex size-11 items-center justify-center rounded-xl bg-linear-to-br ${app.color} text-white shadow-md transition-transform group-hover:scale-105`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground">
                              {app.name}
                            </p>
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {app.description}
                            </p>
                          </div>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                        </Link>
                      </motion.div>
                    );
                  })}

                  <p className="px-2 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Solutions
                  </p>
                  {solutionsItems.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={s.href}
                        initial={mobileItemVariants.initial}
                        animate={mobileItemVariants.animate}
                        transition={{
                          delay: reduced ? 0 : (apps.length + idx) * 0.04,
                        }}
                      >
                        <Link
                          href={s.href}
                          className="group flex items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-muted/60"
                        >
                          <div
                            className={`flex size-11 items-center justify-center rounded-xl bg-linear-to-br ${s.color} text-white shadow-md transition-transform group-hover:scale-105`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground">
                              {s.label}
                            </p>
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {s.shortDescription}
                            </p>
                          </div>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                        </Link>
                      </motion.div>
                    );
                  })}

                  <p className="px-2 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Resources
                  </p>
                  {resourceItems.map((r, idx) => {
                    const Icon = r.icon;
                    const row = (
                      <>
                        <div
                          className={`flex size-11 items-center justify-center rounded-xl bg-linear-to-br ${r.color} text-white shadow-md transition-transform group-hover:scale-105`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">
                            {r.label}
                          </p>
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {r.description}
                          </p>
                        </div>
                        {r.external ? (
                          <ExternalLink className="size-4 shrink-0 text-muted-foreground group-hover:text-accent" />
                        ) : (
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                        )}
                      </>
                    );
                    return (
                      <motion.div
                        key={r.href}
                        initial={mobileItemVariants.initial}
                        animate={mobileItemVariants.animate}
                        transition={{
                          delay: reduced
                            ? 0
                            : (apps.length + solutionsItems.length + idx) * 0.04,
                        }}
                      >
                        {r.external ? (
                          <a
                            href={r.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-muted/60"
                          >
                            {row}
                          </a>
                        ) : (
                          <Link
                            href={r.href}
                            className="group flex items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-muted/60"
                          >
                            {row}
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}

                  <p className="px-2 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    More
                  </p>
                  <Link
                    href="/pricing"
                    className="group flex items-center gap-3.5 rounded-xl p-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-accent to-accent-dark text-accent-foreground shadow-md">
                      <DollarSign className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">Pricing</p>
                      <p className="text-sm text-muted-foreground">
                        Plans & pricing
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </div>

                {ctaVisible && (
                  <div className="shrink-0 border-t border-border/50 bg-background/90 p-3 backdrop-blur-xl sm:p-4">
                    <MarketingButton
                      variant="primary"
                      size="lg"
                      asChild
                      className="w-full rounded-full"
                    >
                      <Link href={ctaUrl ?? "/demo"}>
                        {ctaLabel ?? "Book Demo"}
                      </Link>
                    </MarketingButton>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
