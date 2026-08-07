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
import { Button } from "../ui/button";
import { platformDeepLinks } from "@/lib/platform-nav";
import { getModuleIcon } from "@/lib/icon-map";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QTO_DEV_URL } from "@/lib/constants";
import type { ModuleDetail, SolutionDetail } from "@/types/content";
import type { LucideIcon } from "lucide-react";
import { PaletteToggle } from "@/components/common/PaletteToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { isPalettePickerEnabled } from "@/lib/palette";
import { getButtonTap } from "@/lib/motion";

// Color palette for nav apps
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
  const desktopTriggerBase =
    "group relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200";
  const desktopTriggerInactive =
    "text-muted-foreground hover:text-foreground hover:bg-background/80 hover:shadow-sm";
  const desktopTriggerActive =
    "bg-background text-foreground shadow-sm ring-1 ring-border/70";
  const desktopMenuShell =
    "overflow-hidden rounded-[2rem] border border-border/60 bg-background/88 shadow-[0_32px_80px_-32px_rgba(15,23,42,0.45)] ring-1 ring-white/10 backdrop-blur-2xl dark:border-white/10 dark:ring-white/5";
  const desktopSectionCard =
    "group block rounded-2xl border border-border/70 bg-background/72 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-background hover:shadow-lg";
  const mobileSurface =
    "border border-border/60 bg-background/90 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.55)] ring-1 ring-white/10 backdrop-blur-2xl dark:border-white/10 dark:ring-white/5";

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
      <nav
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[1.75rem] border border-border/60 bg-background/78 px-4 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.45)] ring-1 ring-white/10 backdrop-blur-2xl sm:px-6 lg:px-8 dark:border-white/10 dark:ring-white/5`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName ?? "QTO-ERP"}
              className="h-9 w-auto object-contain"
            />
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent via-accent to-accent-dark flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/30 group-hover:scale-105 transition-all duration-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
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

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1 rounded-full border border-border/50 bg-background/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
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
                  className={`${desktopTriggerBase} ${
                    activeDropdown === item.label
                      ? desktopTriggerActive
                      : desktopTriggerInactive
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-linear-to-r from-accent/70 via-accent to-accent-dark transition-opacity duration-200 ${
                      activeDropdown === item.label ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <motion.div
                    animate={
                      reduced
                        ? undefined
                        : {
                            rotate: activeDropdown === item.label ? 180 : 0,
                          }
                    }
                    transition={{ duration: 0.2 }}
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
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`${desktopTriggerBase} ${desktopTriggerInactive} block`}
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
                      duration: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="fixed left-1/2 top-[4.75rem] z-50 -translate-x-1/2 pt-4"
                    onMouseEnter={() => openDropdown("Platform")}
                    onMouseLeave={closeDropdown}
                  >
                    <div
                      className={`w-[min(52rem,calc(100vw-2rem))] xl:w-212.5 ${desktopMenuShell}`}
                    >
                      {/* Top accent line */}
                      <div className="h-1.5 bg-linear-to-r from-accent/75 via-accent to-accent-dark" />

                      <div className="grid grid-cols-[260px_1fr]">
                        {/* Apps Sidebar */}
                        <div className="border-r border-border/60 bg-muted/35 p-6 backdrop-blur-sm">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse motion-reduce:animate-none" />
                            Platforms{" "}
                          </p>
                          <div className="space-y-1">
                            {apps.map((app) => {
                              const Icon = app.icon;
                              const isActive = hoveredApp === app.slug;
                              return (
                                <motion.button
                                  key={app.slug}
                                  onMouseEnter={() => setHoveredApp(app.slug)}
                                  whileHover={navItemHover}
                                  whileTap={navItemTap}
                                  className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-200 ${
                                    isActive
                                      ? `${app.bgColor} ring-1 ring-border/70 shadow-sm shadow-black/5`
                                      : "hover:bg-background/75"
                                  }`}
                                >
                                  <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                      isActive
                                        ? `bg-linear-to-br ${app.color} text-white shadow-md`
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm font-semibold truncate transition-colors ${
                                        isActive
                                          ? app.textColor
                                          : "text-foreground/80"
                                      }`}
                                    >
                                      {app.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                      {/* {app.description} */}
                                    </p>
                                  </div>
                                  <ArrowRight
                                    className={`w-4 h-4 transition-all duration-200 ${
                                      isActive
                                        ? `opacity-100 translate-x-0 ${app.textColor}`
                                        : "opacity-0 -translate-x-2"
                                    }`}
                                  />
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sections Grid - DYNAMIC PER APP */}
                        <div className="relative overflow-hidden p-7">
                          {/* Background glow */}
                          <div
                            className={`absolute top-0 right-0 h-64 w-64 rounded-full bg-linear-to-br ${currentApp?.color} opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2`}
                          />
                          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/35 to-transparent" />

                          {/* Header */}
                          <div className="flex items-center justify-between mb-5 relative z-10">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl bg-linear-to-br ${currentApp?.color} flex items-center justify-center text-white shadow-lg`}
                              >
                                {currentApp?.icon && <currentApp.icon className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground">
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
                              className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-background/80 ${currentApp?.textColor}`}
                            >
                              View module <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>

                          {/* Features Grid - from real app data */}
                          <div className="grid grid-cols-2 gap-2.5 relative z-10">
                            <AnimatePresence mode="wait">
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
                                    key={links.anchor}
                                    href={`/erp/${currentApp?.slug}${links.anchor}`}
                                    onClick={() => setActiveDropdown(null)}
                                    className={desktopSectionCard}
                                  >
                                    <p className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors">
                                      {links.label}
                                    </p>
                                  </Link>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-6 py-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {apps.slice(0, 4).map((app) => (
                              <div
                                key={app.slug}
                                className={`w-7 h-7 rounded-full bg-linear-to-br ${app.color} flex items-center justify-center text-white text-[10px] border-2 border-card`}
                              >
                                <app.icon className="w-3 h-3" />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground/80">
                              {apps.length}+ modules
                            </span>{" "}
                            to power your business
                          </p>
                        </div>
                        <Link
                          href="/allApps"
                          className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/75 px-4 py-2 text-xs font-semibold text-foreground/80 transition-all hover:border-accent/40 hover:text-accent"
                        >
                          Explore all <ArrowRight className="w-3.5 h-3.5" />
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
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="fixed left-1/2 top-[4.75rem] z-50 -translate-x-1/2 pt-4"
                      onMouseEnter={() => openDropdown("Solutions")}
                      onMouseLeave={closeDropdown}
                    >
                      <div
                        className={`w-[min(46rem,calc(100vw-2rem))] xl:w-187.5 ${desktopMenuShell}`}
                      >
                        {/* Top accent line */}
                        <div className="h-1.5 bg-linear-to-r from-accent/75 via-accent to-accent-dark" />

                        <div className="grid grid-cols-[240px_1fr]">
                          {/* Solutions Sidebar */}
                          <div className="border-r border-border/60 bg-muted/35 p-6 backdrop-blur-sm">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse motion-reduce:animate-none" />
                              Solutions
                            </p>
                            <div className="space-y-1">
                              {solutionsItems.map((sol) => {
                                const Icon = sol.icon;
                                const isActive = hoveredSolution === sol.slug;
                                return (
                                  <motion.button
                                    key={sol.slug}
                                    onMouseEnter={() =>
                                      setHoveredSolution(sol.slug)
                                    }
                                    whileHover={navItemHover}
                                    whileTap={navItemTap}
                                    className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-200 ${
                                      isActive
                                        ? `${sol.bgColor} ring-1 ring-border/70 shadow-sm shadow-black/5`
                                        : "hover:bg-background/75"
                                    }`}
                                  >
                                    <div
                                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                        isActive
                                          ? `bg-linear-to-br ${sol.color} text-white shadow-md`
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-semibold truncate transition-colors ${
                                          isActive
                                            ? sol.textColor
                                            : "text-foreground/80"
                                        }`}
                                      >
                                        {sol.label}
                                      </p>
                                    </div>
                                    <ArrowRight
                                      className={`w-4 h-4 transition-all duration-200 ${
                                        isActive
                                          ? `opacity-100 translate-x-0 ${sol.textColor}`
                                          : "opacity-0 -translate-x-2"
                                      }`}
                                    />
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Solution Details - mirrors Platform pattern */}
                          <div className="relative overflow-hidden p-7">
                            {/* Background glow - updates via currentSol, no animation wrapper needed */}
                            <div
                              className={`absolute top-0 right-0 h-64 w-64 rounded-full bg-linear-to-br ${currentSol.color} opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2 transition-all duration-300`}
                            />
                            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/35 to-transparent" />

                            {/* Static Header - always visible, mirrors Platform */}
                            <div className="flex items-center justify-between mb-5 relative z-10">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${currentSol.color} flex items-center justify-center text-white shadow-lg transition-all duration-200`}
                                >
                                  <currentSol.icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-foreground">
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
                                className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-background/80 ${currentSol.textColor}`}
                              >
                                Explore <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>

                            {/* Use Cases Grid - staggered card animation, keys on hoveredSolution */}
                            <div className="grid grid-cols-2 gap-2.5 relative z-10">
                              <AnimatePresence mode="wait">
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
                                      className={`${desktopSectionCard} h-full`}
                                    >
                                      <p className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors">
                                        {"industry" in useCase
                                          ? useCase.industry
                                          : "title" in useCase
                                            ? useCase.title
                                            : "Use Case"}
                                      </p>
                                      {/* <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                        {useCase.description}
                                      </p> */}
                                    </Link>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        {/* Footer - mirrors Platform footer exactly */}
                        <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-6 py-4 backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {solutionsItems.map((sol) => {
                                const Icon = sol.icon;
                                return (
                                  <div
                                    key={sol.slug}
                                    className={`w-7 h-7 rounded-full bg-linear-to-br ${sol.color} flex items-center justify-center text-white border-2 border-card`}
                                  >
                                    <Icon className="w-3 h-3" />
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground/80">
                                {solutionsItems.length} solutions
                              </span>{" "}
                              for every team
                            </p>
                          </div>
                          <Link
                            href="/allApps"
                            className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/75 px-4 py-2 text-xs font-semibold text-foreground/80 transition-all hover:border-accent/40 hover:text-accent"
                          >
                            Explore all <ArrowRight className="w-3.5 h-3.5" />
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
                      className="absolute right-0 top-full pt-5"
                      onMouseEnter={() => openDropdown("Resources")}
                      onMouseLeave={closeDropdown}
                    >
                      <div className={`w-80 p-2.5 ${desktopMenuShell} rounded-[1.75rem]`}>
                        <div className="mb-2 h-0.5 rounded-full bg-linear-to-r from-accent/60 via-accent to-accent-dark" />
                        {resourceItems.map((r, idx) => {
                          const Icon = r.icon;
                          return r.external ? (
                            <motion.a
                              key={r.href}
                              href={r.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={resourceItemVariants.initial}
                              animate={resourceItemVariants.animate}
                              transition={{
                                delay: reduced ? 0 : idx * 0.05,
                              }}
                              className="group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all hover:bg-background/80"
                            >
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${r.color} text-white shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground group-hover:text-foreground">
                                  {r.label}
                                </p>
                                {r.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {r.description}
                                  </p>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </motion.a>
                          ) : (
                            <motion.div
                              key={r.href}
                              initial={resourceItemVariants.initial}
                              animate={resourceItemVariants.animate}
                              transition={{
                                delay: reduced ? 0 : idx * 0.05,
                              }}
                            >
                              <Link
                                href={r.href}
                                className="group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all hover:bg-background/80"
                              >
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${r.color} text-white shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground group-hover:text-foreground">
                                    {r.label}
                                  </p>
                                  {r.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {r.description}
                                    </p>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
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

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/50 bg-background/55 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {isPalettePickerEnabled() && <PaletteToggle />}
          <ThemeToggle />
          {ctaVisible && (
            <Link href={ctaUrl ?? "/demo"}>
              <Button className="rounded-full px-5 shadow-lg shadow-accent/20">
                {ctaLabel ?? "Book Demo"}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-1 rounded-full border border-border/50 bg-background/60 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {isPalettePickerEnabled() && <PaletteToggle />}
          <ThemeToggle />
          <button
            className="rounded-full p-2.5 transition-colors hover:bg-background/80"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileDrawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-[5.25rem] z-40 px-3 pb-3 lg:hidden sm:px-4"
          >
            <div
              className={`relative flex h-full max-h-full flex-col overflow-hidden rounded-[2rem] ${mobileSurface}`}
            >
              <div className="absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent" />
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 sm:p-5">
                {/* Modules */}
                <p className="px-2 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Platforms
                </p>
                {apps.map((app, idx) => {
                  const Icon = app.icon;
                  return (
                    <motion.div
                      key={app.slug}
                      initial={mobileItemVariants.initial}
                      animate={mobileItemVariants.animate}
                      transition={{ delay: reduced ? 0 : idx * 0.05 }}
                    >
                      <Link
                        href={`/erp/${app.slug}`}
                        className="group flex items-center gap-4 rounded-2xl p-3.5 transition-colors hover:bg-background/80"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${app.color} text-white shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {app.name}
                          </p>
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {app.description}
                          </p>
                        </div>
                        <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Solutions */}
                <p className="px-2 py-3 pt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                        delay: reduced ? 0 : (apps.length + idx) * 0.05,
                      }}
                    >
                      <Link
                        href={s.href}
                        className="group flex items-center gap-4 rounded-2xl p-3.5 transition-colors hover:bg-background/80"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${s.color} text-white shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {s.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {s.description}
                          </p>
                        </div>
                        <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Resources */}
                <p className="px-2 py-3 pt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Resources
                </p>
                {resourceItems.map((r, idx) => {
                  const Icon = r.icon;
                  return (
                    <motion.div
                      key={r.href}
                      initial={mobileItemVariants.initial}
                      animate={mobileItemVariants.animate}
                      transition={{
                        delay: reduced
                          ? 0
                          : (apps.length + solutionsItems.length + idx) * 0.05,
                      }}
                    >
                      {r.external ? (
                        <a
                          href={r.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 rounded-2xl p-3.5 transition-colors hover:bg-background/80"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${r.color} text-white shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {r.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {r.description}
                            </p>
                          </div>
                          <ExternalLink className="ml-auto h-5 w-5 text-muted-foreground transition-all group-hover:text-accent" />
                        </a>
                      ) : (
                        <Link
                          href={r.href}
                          className="group flex items-center gap-4 rounded-2xl p-3.5 transition-colors hover:bg-background/80"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${r.color} text-white shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {r.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {r.description}
                            </p>
                          </div>
                          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}

                {/* Pricing link */}
                <p className="px-2 py-3 pt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  More
                </p>
                <Link
                  href="/pricing"
                  className="group flex items-center gap-4 rounded-2xl p-3.5 transition-colors hover:bg-background/80"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-muted-foreground to-foreground text-white shadow-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Pricing</p>
                    <p className="text-sm text-muted-foreground">
                      Plans & pricing
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </div>
              {/* Pinned bottom CTA — always reachable (not sticky-inside-scroll) */}
              {ctaVisible && (
                <div className="shrink-0 border-t border-border/50 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/75 p-2 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.5)]">
                    <Link
                      href={ctaUrl ?? "/demo"}
                      className="flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-linear-to-r from-accent to-accent-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20"
                    >
                      {ctaLabel ?? "Book Demo"} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
