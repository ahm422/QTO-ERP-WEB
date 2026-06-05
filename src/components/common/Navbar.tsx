"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { platformDeepLinks } from "@/lib/platform-nav";
import { getModuleIcon } from "@/lib/icon-map";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QTO_DEV_URL } from "@/lib/constants";
import type { ModuleDetail, SolutionDetail } from "@/types/content";
import { ThemeToggle } from "@/components/common/ThemeToggle";

// Color palette for nav apps
const navAppColors = [
  {
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
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
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      textColor: "text-blue-600 dark:text-blue-400",
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
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      textColor: "text-purple-600 dark:text-purple-400",
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
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
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
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      textColor: "text-amber-600 dark:text-amber-400",
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
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      textColor: "text-rose-600 dark:text-rose-400",
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
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      textColor: "text-cyan-600 dark:text-cyan-400",
      useCases: moduleUseCases("finance"),
    },
  ];
}

const resourcesItems = [
  {
    label: "Blog",
    href: "/blog",
    description: "Latest updates",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-500",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "About Us",
    href: "/about",
    description: "Learn more",
    icon: Info,
    color: "from-amber-500 to-orange-500",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Contact Us",
    href: "/contact",
    description: "Get in touch",
    icon: Mail,
    color: "from-amber-500 to-orange-500",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "QTO Dev",
    href: QTO_DEV_URL,
    external: true,
    description: "Web development partner",
    icon: ExternalLink,
    color: "from-rose-500 to-pink-500",
    textColor: "text-rose-600 dark:text-rose-400",
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
};

export default function NavbarV3({
  modules,
  solutions,
  siteName,
  logoUrl,
  ctaLabel,
  ctaUrl,
  ctaVisible = true,
}: NavbarProps) {
  const apps = useMemo(() => buildNavApps(modules), [modules]);
  const solutionsItems = useMemo(
    () => buildSolutionsItems(solutions, modules),
    [solutions, modules],
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string>(modules[0]?.slug ?? "");
  const [hoveredSolution, setHoveredSolution] = useState<string>(
    "hr-teams",
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

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

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
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
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 group-hover:scale-105 transition-all duration-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {(siteName ?? "QTO-ERP").split("-")[0]}
                </span>
                <span className="text-slate-800 dark:text-slate-100">
                  {(siteName ?? "QTO-ERP").includes("-")
                    ? `-${(siteName ?? "QTO-ERP").split("-").slice(1).join("-")}`
                    : ""}
                </span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center">
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
                  className={`flex items-center gap-1.5 px-4 py-2 mx-0.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeDropdown === item.label
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                  <motion.div
                    animate={{
                      rotate: activeDropdown === item.label ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="px-4 py-2 mx-0.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-xl block"
                >
                  {item.label}
                </Link>
              )}

              {/* Platform Mega Menu */}
              <AnimatePresence>
                {item.label === "Platform" && activeDropdown === "Platform" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-4"
                    onMouseEnter={() => openDropdown("Platform")}
                    onMouseLeave={closeDropdown}
                  >
                    <div className="w-212.5 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-slate-400/20 dark:shadow-black/50 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                      {/* Top accent line */}
                      <div className="h-1 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500" />

                      <div className="grid grid-cols-[260px_1fr]">
                        {/* Apps Sidebar */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/30 p-5 border-r border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            Platfroms{" "}
                          </p>
                          <div className="space-y-1">
                            {apps.map((app) => {
                              const Icon = app.icon;
                              const isActive = hoveredApp === app.slug;
                              return (
                                <motion.button
                                  key={app.slug}
                                  onMouseEnter={() => setHoveredApp(app.slug)}
                                  whileHover={{ x: 3 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                                    isActive
                                      ? `${app.bgColor} ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm`
                                      : "hover:bg-white dark:hover:bg-slate-700/50"
                                  }`}
                                >
                                  <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                      isActive
                                        ? `bg-linear-to-br ${app.color} text-white shadow-md`
                                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm font-semibold truncate transition-colors ${
                                        isActive
                                          ? app.textColor
                                          : "text-slate-700 dark:text-slate-300"
                                      }`}
                                    >
                                      {app.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">
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
                        <div className="p-6 relative overflow-hidden">
                          {/* Background glow */}
                          <div
                            className={`absolute top-0 right-0 w-64 h-64 bg-linear-to-br ${currentApp?.color} opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`}
                          />

                          {/* Header */}
                          <div className="flex items-center justify-between mb-5 relative z-10">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl bg-linear-to-br ${currentApp?.color} flex items-center justify-center text-white shadow-lg`}
                              >
                                {currentApp?.icon && <currentApp.icon className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {currentApp?.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {currentApp?.features.length} features
                                </p>
                              </div>
                            </div>
                            <Link
                              href={`/erp/${currentApp?.slug}`}
                              onClick={() => setActiveDropdown(null)}
                              className={`text-xs font-semibold ${currentApp?.textColor} hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
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
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{
                                    delay: idx * 0.03,
                                    duration: 0.15,
                                  }}
                                >
                                  <Link
                                    key={links.anchor}
                                    href={`/erp/${currentApp?.slug}${links.anchor}`}
                                    onClick={() => setActiveDropdown(null)}
                                    className="group block p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-200"
                                  >
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
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
                      <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {apps.slice(0, 4).map((app) => (
                              <div
                                key={app.slug}
                                className={`w-7 h-7 rounded-full bg-linear-to-br ${app.color} flex items-center justify-center text-white text-[10px] border-2 border-white dark:border-slate-900`}
                              >
                                <app.icon className="w-3 h-3" />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {apps.length}+ modules
                            </span>{" "}
                            to power your business
                          </p>
                        </div>
                        <Link
                          href="/allApps"
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all"
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
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="absolute left-1/2 -translate-x-1/2 top-full pt-4"
                      onMouseEnter={() => openDropdown("Solutions")}
                      onMouseLeave={closeDropdown}
                    >
                      <div className="w-187.5 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-slate-400/20 dark:shadow-black/50 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                        {/* Top accent line */}
                        <div className="h-1 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500" />

                        <div className="grid grid-cols-[240px_1fr]">
                          {/* Solutions Sidebar */}
                          <div className="bg-slate-50/80 dark:bg-slate-800/30 p-5 border-r border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
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
                                    whileHover={{ x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                                      isActive
                                        ? `${sol.bgColor} ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm`
                                        : "hover:bg-white dark:hover:bg-slate-700/50"
                                    }`}
                                  >
                                    <div
                                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                        isActive
                                          ? `bg-linear-to-br ${sol.color} text-white shadow-md`
                                          : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                      }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-semibold truncate transition-colors ${
                                          isActive
                                            ? sol.textColor
                                            : "text-slate-700 dark:text-slate-300"
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
                          <div className="p-6 relative overflow-hidden">
                            {/* Background glow - updates via currentSol, no animation wrapper needed */}
                            <div
                              className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${currentSol.color} opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-300`}
                            />

                            {/* Static Header - always visible, mirrors Platform */}
                            <div className="flex items-center justify-between mb-5 relative z-10">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentSol.color} flex items-center justify-center text-white shadow-lg transition-all duration-200`}
                                >
                                  <currentSol.icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {currentSol.label}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {currentSol.useCases?.length ?? 0} use cases
                                  </p>
                                </div>
                              </div>
                              <Link
                                href={currentSol.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`text-xs font-semibold ${currentSol.textColor} hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
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
                                               initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{
                                      delay: idx * 0.04,
                                      duration: 0.15,
                                    }}
                                  >
                                    <Link
                                      href={currentSol.href}                                      onClick={() => setActiveDropdown(null)}
                                      className="group block p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-200 h-full"
                                    >
                                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {(useCase as any).industry || (useCase as any).title || "Use Case"}                                      </p>
                                      {/* <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
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
                        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {solutionsItems.map((sol) => {
                                const Icon = sol.icon;
                                return (
                                  <div
                                    key={sol.slug}
                                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${sol.color} flex items-center justify-center text-white border-2 border-white dark:border-slate-900`}
                                  >
                                    <Icon className="w-3 h-3" />
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-xs text-slate-500">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {solutionsItems.length} solutions
                              </span>{" "}
                              for every team
                            </p>
                          </div>
                          <Link
                            href="/allApps"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all"
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
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full pt-4"
                      onMouseEnter={() => openDropdown("Resources")}
                      onMouseLeave={closeDropdown}
                    >
                      <div className="w-72 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-300/30 dark:shadow-black/50 ring-1 ring-slate-200 dark:ring-slate-700 p-2 overflow-hidden">
                        <div className="h-0.5 bg-linear-to-r from-orange-500 to-amber-500 mb-2" />
                        {resourcesItems.map((r, idx) => {
                          const Icon = r.icon;
                          return r.external ? (
                            <motion.a
                              key={r.href}
                              href={r.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                            >
                              <div
                                className={`w-10 h-10 rounded-xl bg-linear-to-br ${r.color} flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                                  {r.label}
                                </p>
                                {r.description && (
                                  <p className="text-xs text-slate-500">
                                    {r.description}
                                  </p>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </motion.a>
                          ) : (
                            <motion.div
                              key={r.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Link
                                href={r.href}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                              >
                                <div
                                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${r.color} flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                                    {r.label}
                                  </p>
                                  {r.description && (
                                    <p className="text-xs text-slate-500">
                                      {r.description}
                                    </p>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
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
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {ctaVisible && (
            <Link href={ctaUrl ?? "/demo"}>
              <Button>{ctaLabel ?? "Book Demo"}</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 top-16 z-40 bg-white dark:bg-slate-950 lg:hidden overflow-y-auto"
          >
            <div className="p-4 pb-28 space-y-1">
              {/* Modules */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-3">
                Platfroms
              </p>
              {apps.map((app, idx) => {
                const Icon = app.icon;
                return (
                  <motion.div
                    key={app.slug}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/erp/${app.slug}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-linear-to-br ${app.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {app.name}
                        </p>
                        <p className="text-sm text-slate-500 line-clamp-1">
                          {app.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                );
              })}

              {/* Solutions */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-3 pt-6">
                Solutions
              </p>
              {solutionsItems.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (apps.length + idx) * 0.05 }}
                  >
                    <Link
                      href={s.href}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-linear-to-br ${s.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {s.label}
                        </p>
                        <p className="text-sm text-slate-500">
                          {s.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                );
              })}

              {/* Resources */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-3 pt-6">
                Resources
              </p>
              {resourcesItems.map((r, idx) => {
                const Icon = r.icon;
                return (
                  <motion.div
                    key={r.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (apps.length + solutionsItems.length + idx) * 0.05,
                    }}
                  >
                    {r.external ? (
                      <a
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-linear-to-br ${r.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {r.label}
                          </p>
                          <p className="text-sm text-slate-500">
                            {r.description}
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-300 ml-auto group-hover:text-orange-500 transition-all" />
                      </a>
                    ) : (
                      <Link
                        href={r.href}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-linear-to-br ${r.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {r.label}
                          </p>
                          <p className="text-sm text-slate-500">
                            {r.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}

              {/* Pricing link */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-3 pt-6">
                More
              </p>
              <Link
                href="/pricing"
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white shadow-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Pricing
                  </p>
                  <p className="text-sm text-slate-500">Plans & pricing</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            {/* Sticky bottom CTA */}
            {ctaVisible && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 lg:hidden">
                <Link
                  href={ctaUrl ?? "/demo"}
                  className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-white bg-linear-to-r from-orange-500 to-amber-500 px-4 py-3.5 rounded-xl shadow-lg shadow-orange-500/20"
                >
                  <Button>
                    {ctaLabel ?? "Book Demo"} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
