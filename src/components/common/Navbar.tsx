"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import type { WheelEvent } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  ArrowRight,
  Sparkles,
  BookOpen,
  Info,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MarketingButton } from "@/components/ui/marketing-button";
import { getModuleIcon } from "@/lib/icon-map";
import { getSolutionIcon } from "@/lib/solution-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QTO_DEV_URL } from "@/lib/constants";
import type { ModuleDetail, SolutionDetail } from "@/types/content";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { cn } from "@/lib/utils";

function buildNavApps(modules: ModuleDetail[]) {
  return modules.map((app) => ({
    slug: app.slug,
    name: app.name,
    icon: getModuleIcon(app.iconKey),
    description: app.shortDescription,
    features: app.features.slice(0, 6).map((f) => ({
      label: f.title,
      description: f.description,
    })),
  }));
}

const navItems = [
  { label: "Platform", href: "/allApps", hasMega: true },
  { label: "Solutions", href: "#", hasDropdown: true },
  { label: "Resources", href: "#", hasDropdown: true },
];

/** Builds the Solutions menu from the published CMS solutions (already sorted by sortOrder). */
function buildSolutionsItems(solutions: SolutionDetail[]) {
  return solutions.map((sol) => {
    const href = `/solution/${sol.slug}`;
    return {
      slug: sol.slug,
      label: sol.title,
      href,
      shortDescription: sol.audience,
      description: sol.heroSubheadline,
      icon: getSolutionIcon(sol.slug),
      useCases: (sol.useCases ?? []).map((uc) => ({
        label: uc.industry,
        href: `${href}?industry=${encodeURIComponent(uc.slug)}`,
      })),
    };
  });
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

const resourcesItems = [
  {
    label: "Blog",
    href: "/blog",
    description: "Latest updates",
    icon: BookOpen,
  },
  {
    label: "About Us",
    href: "/about",
    description: "Learn more",
    icon: Info,
  },
  {
    label: "Contact Us",
    href: "/contact",
    description: "Get in touch",
    icon: Mail,
  },
  {
    label: "QTO Dev",
    href: QTO_DEV_URL,
    external: true,
    description: "Web development partner",
    icon: ExternalLink,
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
    () => buildSolutionsItems(solutions),
    [solutions],
  );
  const resourceItems = useMemo(
    () =>
      navResources && navResources.length > 0
        ? navResources.map((r) => ({
            ...r,
            description: r.subtitle,
            icon: getNavResourceIcon(r.iconKey),
          }))
        : resourcesItems,
    [navResources],
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string>(modules[0]?.slug ?? "");
  const [hoveredSolution, setHoveredSolution] = useState<string>(
    solutions[0]?.slug ?? "",
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuLayout, setMenuLayoutState] = useState<"tabs" | "list">("tabs");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // One-time read of a client-only store (localStorage isn't available during SSR,
    // so this can't be a lazy useState initializer without a hydration mismatch).
    try {
      const saved = window.localStorage.getItem("qto-nav-menu-layout");
      if (saved === "tabs" || saved === "list") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMenuLayoutState(saved);
      }
    } catch {
      // localStorage unavailable (private mode, disabled storage) — keep default
    }
  }, []);

  const setMenuLayout = (value: "tabs" | "list") => {
    setMenuLayoutState(value);
    try {
      window.localStorage.setItem("qto-nav-menu-layout", value);
    } catch {
      // ignore write failures
    }
  };
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

  /** Lets a plain mouse wheel scroll the horizontal tab row (trackpad/drag already work natively). */
  const handleTabRowWheel = (e: WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    el.scrollLeft += e.deltaY;
    e.preventDefault();
  };

  /** Refined floating glass — warm brand rim, not chunky chrome. Deepens on scroll. */
  const barShell = cn(
    "relative mx-auto flex max-w-7xl items-center justify-between gap-3 transition-[height,box-shadow] duration-300",
    scrolled ? "h-[3.25rem] sm:h-14" : "h-14 sm:h-[3.75rem]",
    "rounded-2xl border border-border/50 bg-background/70 px-3 sm:px-4 lg:px-5",
    "ring-1 ring-inset ring-[var(--nav-ring)] backdrop-blur-2xl",
    scrolled
      ? "shadow-[var(--nav-shadow-scrolled)] bg-background/85 dark:bg-card/70"
      : "shadow-[var(--nav-shadow)] dark:bg-card/55",
    "dark:border-white/10",
    "before:pointer-events-none before:absolute before:inset-x-8 before:-top-px before:h-px",
    "before:bg-linear-to-r before:from-transparent before:via-[var(--nav-rim)] before:to-transparent",
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
    "shadow-[var(--nav-menu-shadow)]",
    "backdrop-blur-2xl dark:bg-card/92 dark:border-white/10",
  );

  const mobileSurface = cn(
    "border border-border/50 bg-background/95 shadow-[var(--nav-mobile-shadow)]",
    "backdrop-blur-2xl dark:bg-card/95 dark:border-white/10",
  );

  /** Tabbed dropdown — unified accent tint (no per-module rainbow), scrollable on narrow screens */
  const menuTabBtn = (isActive: boolean) =>
    cn(
      "group inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold whitespace-nowrap transition-all duration-200",
      isActive
        ? "bg-accent/12 text-accent shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_30%,transparent)]"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    );
  const menuTabIcon = (isActive: boolean) =>
    cn(
      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
      isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground",
    );
  const menuListRow = cn(
    "group flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200",
    "hover:bg-muted/50",
  );
  const menuIconChip =
    "flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent transition-transform duration-200 group-hover:scale-105";

  /** Lets a visitor pick tabbed vs. flat-list presentation for the Platform/Solutions dropdowns; remembered via localStorage. */
  function MenuLayoutSwitch({ label }: { label: string }) {
    return (
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/15 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <div className="inline-flex rounded-lg border border-border/60 bg-background/60 p-0.5">
          {(["tabs", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMenuLayout(mode)}
              aria-pressed={menuLayout === mode}
              className={cn(
                "rounded-[0.4rem] px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors duration-150",
                menuLayout === mode
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    );
  }

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

              {/* Platform Dropdown — tabbed */}
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
                    className="fixed left-1/2 top-[4.35rem] z-50 w-[min(30rem,calc(100vw-1.5rem))] -translate-x-1/2 pt-3"
                    onMouseEnter={() => openDropdown("Platform")}
                    onMouseLeave={closeDropdown}
                  >
                    <div className={desktopMenuShell}>
                      <div className="h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />

                      <MenuLayoutSwitch label="Platform" />

                      {menuLayout === "tabs" ? (
                        <>
                          {/* Tab row */}
                          <div
                            role="tablist"
                            aria-label="Platform modules"
                            onWheel={handleTabRowWheel}
                            className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-border/50 bg-muted/15 p-2"
                          >
                            {apps.map((app) => {
                              const Icon = app.icon;
                              const isActive = hoveredApp === app.slug;
                              return (
                                <button
                                  key={app.slug}
                                  type="button"
                                  role="tab"
                                  aria-selected={isActive}
                                  onMouseEnter={() => setHoveredApp(app.slug)}
                                  onFocus={() => setHoveredApp(app.slug)}
                                  className={menuTabBtn(isActive)}
                                >
                                  <span className={menuTabIcon(isActive)}>
                                    <Icon className="size-3.5" />
                                  </span>
                                  {app.name}
                                </button>
                              );
                            })}
                          </div>

                          {/* Active tab body */}
                          <div className="relative overflow-hidden p-5 sm:p-6">
                            <div className="pointer-events-none absolute -right-10 -top-12 size-48 rounded-full bg-accent/10 blur-3xl" />

                            <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_25%,transparent)]">
                                  {currentApp?.icon && (
                                    <currentApp.icon className="size-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-display text-sm font-bold text-foreground">
                                    {currentApp?.name}
                                  </p>
                                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                    {currentApp?.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <AnimatePresence mode="wait">
                              <motion.div
                                key={hoveredApp}
                                variants={listItemVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.15 }}
                                className="relative z-10 space-y-0.5"
                              >
                                {(currentApp?.features ?? []).slice(0, 4).map((f) => (
                                  <Link
                                    key={f.label}
                                    href={`/erp/${currentApp?.slug}#features`}
                                    onClick={() => setActiveDropdown(null)}
                                    className={menuListRow}
                                  >
                                    <span className="font-medium text-foreground">
                                      {f.label}
                                    </span>
                                    <ArrowRight className="size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
                                  </Link>
                                ))}
                              </motion.div>
                            </AnimatePresence>

                            <Link
                              href={`/erp/${currentApp?.slug}`}
                              onClick={() => setActiveDropdown(null)}
                              className="relative z-10 mt-3 inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/15"
                            >
                              View module <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div className="nav-scroll-y max-h-96 space-y-0.5 overflow-y-auto p-2">
                          {apps.map((app) => {
                            const Icon = app.icon;
                            return (
                              <Link
                                key={app.slug}
                                href={`/erp/${app.slug}`}
                                onClick={() => setActiveDropdown(null)}
                                className={menuListRow}
                              >
                                <span className="flex min-w-0 items-center gap-3">
                                  <span className={menuIconChip}>
                                    <Icon className="size-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate font-medium text-foreground">
                                      {app.name}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                      {app.description}
                                    </span>
                                  </span>
                                </span>
                                <ArrowRight className="size-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-3 border-t border-border/50 bg-muted/20 px-5 py-3 sm:px-6">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {apps.length}+ modules
                          </span>{" "}
                          to power your business
                        </p>
                        <Link
                          href="/allApps"
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-accent/40 hover:text-accent"
                        >
                          Explore all <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Solutions Dropdown — tabbed */}
                {item.label === "Solutions" &&
                  activeDropdown === "Solutions" &&
                  currentSol && (
                    <motion.div
                      variants={megaMenuVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{
                        duration: 0.22,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="fixed left-1/2 top-[4.35rem] z-50 w-[min(30rem,calc(100vw-1.5rem))] -translate-x-1/2 pt-3"
                      onMouseEnter={() => openDropdown("Solutions")}
                      onMouseLeave={closeDropdown}
                    >
                      <div className={desktopMenuShell}>
                        <div className="h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />

                        <MenuLayoutSwitch label="Solutions" />

                        {menuLayout === "tabs" ? (
                          <>
                            {/* Tab row */}
                            <div
                              role="tablist"
                              aria-label="Solutions"
                              onWheel={handleTabRowWheel}
                              className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-border/50 bg-muted/15 p-2"
                            >
                              {solutionsItems.map((sol) => {
                                const Icon = sol.icon;
                                const isActive = hoveredSolution === sol.slug;
                                return (
                                  <button
                                    key={sol.slug}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onMouseEnter={() => setHoveredSolution(sol.slug)}
                                    onFocus={() => setHoveredSolution(sol.slug)}
                                    className={menuTabBtn(isActive)}
                                  >
                                    <span className={menuTabIcon(isActive)}>
                                      <Icon className="size-3.5" />
                                    </span>
                                    {sol.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Active tab body */}
                            <div className="relative overflow-hidden p-5 sm:p-6">
                              <div className="pointer-events-none absolute -right-10 -top-12 size-48 rounded-full bg-accent/10 blur-3xl" />

                              <div className="relative z-10 mb-4 flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_25%,transparent)]">
                                  <currentSol.icon className="size-5" />
                                </div>
                                <div>
                                  <p className="font-display text-sm font-bold text-foreground">
                                    {currentSol.label}
                                  </p>
                                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                    {currentSol.description}
                                  </p>
                                </div>
                              </div>

                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={hoveredSolution}
                                  variants={listItemVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  transition={{ duration: 0.15 }}
                                  className="relative z-10 space-y-0.5"
                                >
                                  {currentSol.useCases.slice(0, 4).map((useCase) => (
                                    <Link
                                      key={useCase.href}
                                      href={useCase.href}
                                      onClick={() => setActiveDropdown(null)}
                                      className={menuListRow}
                                    >
                                      <span className="font-medium text-foreground">
                                        {useCase.label}
                                      </span>
                                      <ArrowRight className="size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
                                    </Link>
                                  ))}
                                </motion.div>
                              </AnimatePresence>

                              <Link
                                href={currentSol.href}
                                onClick={() => setActiveDropdown(null)}
                                className="relative z-10 mt-3 inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/15"
                              >
                                Explore <ArrowRight className="size-3" />
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="nav-scroll-y max-h-96 space-y-0.5 overflow-y-auto p-2">
                            {solutionsItems.map((sol) => {
                              const Icon = sol.icon;
                              return (
                                <Link
                                  key={sol.slug}
                                  href={sol.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className={menuListRow}
                                >
                                  <span className="flex min-w-0 items-center gap-3">
                                    <span className={menuIconChip}>
                                      <Icon className="size-4" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block truncate font-medium text-foreground">
                                        {sol.label}
                                      </span>
                                      <span className="block truncate text-xs text-muted-foreground">
                                        {sol.shortDescription}
                                      </span>
                                    </span>
                                  </span>
                                  <ArrowRight className="size-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 border-t border-border/50 bg-muted/20 px-5 py-3 sm:px-6">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {solutionsItems.length} solutions
                            </span>{" "}
                            for every team
                          </p>
                          <Link
                            href="/solutions"
                            onClick={() => setActiveDropdown(null)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-accent/40 hover:text-accent"
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
                      <div className={cn(desktopMenuShell, "w-[min(22rem,calc(100vw-2rem))]")}>
                        <div className="h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />
                        <p className="border-b border-border/50 bg-muted/15 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Resources
                        </p>
                        <div className="p-2">
                          {resourceItems.map((r, idx) => {
                            const Icon = r.icon;
                            const body = (
                              <>
                                <span className="flex min-w-0 items-center gap-3">
                                  <span className={menuIconChip}>
                                    <Icon className="size-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate font-medium text-foreground">
                                      {r.label}
                                    </span>
                                    {r.description && (
                                      <span className="block truncate text-xs text-muted-foreground">
                                        {r.description}
                                      </span>
                                    )}
                                  </span>
                                </span>
                                {r.external ? (
                                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                                ) : (
                                  <ArrowRight className="size-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
                                )}
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
                                className={menuListRow}
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
                                <Link href={r.href} className={menuListRow}>
                                  {body}
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
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
                          <div className="flex size-11 items-center justify-center rounded-xl bg-accent/12 text-accent shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_22%,transparent)] transition-transform group-hover:scale-105">
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

                  {solutionsItems.length > 0 && (
                    <p className="px-2 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Solutions
                    </p>
                  )}
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
                          <div className="flex size-11 items-center justify-center rounded-xl bg-accent/12 text-accent shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_22%,transparent)] transition-transform group-hover:scale-105">
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
                        <div className="flex size-11 items-center justify-center rounded-xl bg-accent/12 text-accent shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent)_22%,transparent)] transition-transform group-hover:scale-105">
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
