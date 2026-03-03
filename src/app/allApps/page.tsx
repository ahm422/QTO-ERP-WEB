"use client";

import Link from "next/link";
import { apps } from "@/lib/apps";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { CTASection } from "@/components/ui/CTASection";

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

export default function AllAppsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10 blur-3xl rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
              across all business functions. From workforce management to
              project execution, every module works seamlessly together to
              transform your business processes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeaderSections tag="Platforms" title="Explore All Apps" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-10">
            {apps.map((app, idx) => {
              const colors = getAppColor(idx);
              const Icon = app.icon;
              return (
                <motion.div
                  key={app.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={`/erp/${app.slug}`}
                    className={`group relative block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 transition-all duration-300 ${colors.borderHover} hover:shadow-xl ${colors.shadowHover} h-full min-h-[400px]`}
                  >
                    {/* Glow */}
                    <div
                      className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colors.color} opacity-0 group-hover:opacity-5 blur-3xl rounded-full transition-opacity duration-500 -translate-y-1/2 translate-x-1/2`}
                    />

                    <div className="relative z-10 flex flex-col gap-5">
                      {/* Icon + Title Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
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

                      {/* Description */}
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {" "}
                        {app.shortDescription}
                      </p>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2 min-h-[2rem]">
                        {" "}
                        {app.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg ${colors.bgColor} ${colors.textColor}`}
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Features preview */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 min-h-[5rem]">
                        {" "}
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

                      {/* CTA */}
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
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
