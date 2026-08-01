"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { CTASection } from "@/components/ui/CTASection";
import { getModuleIcon } from "@/lib/icon-map";
import {
  getCardHover,
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from "@/lib/motion";
import type { ModuleDetail } from "@/types/content";

const appColors = [
  {
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-300 dark:hover:border-blue-700",
    shadowHover: "hover:shadow-blue-100 dark:hover:shadow-blue-950/30",
  },
  {
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    textColor: "text-purple-600 dark:text-purple-400",
    borderHover: "hover:border-purple-300 dark:hover:border-purple-700",
    shadowHover: "hover:shadow-purple-100 dark:hover:shadow-purple-950/30",
  },
  {
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700",
    shadowHover: "hover:shadow-emerald-100 dark:hover:shadow-emerald-950/30",
  },
  {
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-700",
    shadowHover: "hover:shadow-amber-100 dark:hover:shadow-amber-950/30",
  },
];

function getAppColor(index: number) {
  return appColors[index % appColors.length];
}

type AllAppsGridProps = {
  modules: ModuleDetail[];
};

export default function AllAppsGrid({ modules }: AllAppsGridProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);

  return (
    <>
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10 blur-3xl rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              Comprehensive ERP Suite{" "}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Unified Business Management{" "}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Platform{" "}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Discover our integrated suite of enterprise applications designed
              to streamline operations, enhance productivity, and drive growth
              across all business functions.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeaderSections tag="Platforms" title="Explore More" />

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-10"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {modules.map((app, idx) => {
              const colors = getAppColor(idx);
              const Icon = getModuleIcon(app.iconKey);
              return (
                <motion.div
                  key={app.slug}
                  variants={item}
                  whileHover={hover}
                >
                  <Link
                    href={`/erp/${app.slug}`}
                    className={`group relative block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 transition-[border-color,box-shadow] duration-300 ${colors.borderHover} hover:shadow-xl ${colors.shadowHover} h-full min-h-[400px]`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colors.color} opacity-0 group-hover:opacity-5 blur-3xl rounded-full transition-opacity duration-500 -translate-y-1/2 translate-x-1/2`}
                    />

                    <div className="relative z-10 flex flex-col gap-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <motion.div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.color} flex items-center justify-center text-white shadow-lg`}
                            whileHover={
                              reduced ? undefined : { scale: 1.08 }
                            }
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                          >
                            <Icon className="w-6 h-6" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {app.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {app.bestFor}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-5 h-5 ${colors.textColor} opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 mt-1`}
                        />
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {app.cardTagline ?? app.shortDescription}
                      </p>

                      <div className="flex flex-wrap gap-2 min-h-[2rem]">
                        {app.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg ${colors.bgColor} ${colors.textColor}`}
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 min-h-[5rem]">
                        {app.features.slice(0, 4).map((feature) => (
                          <div
                            key={feature.title}
                            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${colors.color}`}
                            />
                            {feature.title}
                          </div>
                        ))}
                      </div>

                      <div
                        className={`flex items-center gap-1.5 text-sm font-semibold ${colors.textColor}`}
                      >
                        Learn more
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <CTASection
        headline="Ready to Simplify Your Operations with QTO ERP?"
        primaryLabel="Schedule a Demo"
        primaryHref="/demo"
        secondaryLabel="View Pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}
