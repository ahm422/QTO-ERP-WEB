"use client";

import {
  useRef,
  useEffect,
  useState,
  isValidElement,
  type ReactNode,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from "@/lib/motion";

export type StatItem = {
  value: number;
  suffix?: string;
  label: string;
  /** Lucide icon, emoji string, or custom node */
  icon?: LucideIcon | ReactNode | string;
};

function formatAnimatedValue(v: number, target: number): string {
  const decimals =
    Number.isInteger(target) || Math.abs(target % 1) < 1e-9
      ? 0
      : String(target).split(".")[1]?.length ?? 1;
  return decimals === 0 ? Math.round(v).toString() : v.toFixed(decimals);
}

function AnimatedNumber({
  target,
  suffix,
  inView,
  reduced,
}: {
  target: number;
  suffix?: string;
  inView: boolean;
  reduced: boolean | null;
}) {
  const [display, setDisplay] = useState(() => formatAnimatedValue(0, target));

  useEffect(() => {
    if (!inView || reduced) return;

    let frame = 0;
    const duration = 2000;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(formatAnimatedValue(target * eased, target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, reduced]);

  const shown = reduced
    ? formatAnimatedValue(target, target)
    : display;

  return (
    <span className="tabular-nums">
      {shown}
      {suffix}
    </span>
  );
}

function renderIcon(icon: StatItem["icon"]) {
  if (icon == null || icon === "") return null;
  if (typeof icon === "string") {
    return <span className="text-lg leading-none">{icon}</span>;
  }
  if (isValidElement(icon)) return icon;
  const Icon = icon as LucideIcon;
  return <Icon aria-hidden="true" className="size-5" />;
}

export type StatTileProps = {
  stat: StatItem;
  inView?: boolean;
  reduced?: boolean | null;
  className?: string;
};

export function StatTile({
  stat,
  inView = true,
  reduced = false,
  className,
}: StatTileProps) {
  const iconNode = renderIcon(stat.icon);

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {iconNode != null ? (
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {iconNode}
        </div>
      ) : null}

      <div className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        <AnimatedNumber
          target={stat.value}
          suffix={stat.suffix}
          inView={inView}
          reduced={reduced}
        />
      </div>

      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {stat.label}
      </p>
    </div>
  );
}

export type StatsStripProps = {
  stats: StatItem[];
  className?: string;
};

export function StatsStrip({ stats, className }: StatsStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn(
        "mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4 md:gap-6",
        className
      )}
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={item}>
          <StatTile stat={stat} inView={inView} reduced={reduced} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default StatsStrip;
