"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardIcon,
  CardTitle,
} from "@/components/ui/card";
import { getFadeInUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type StepCardProps = {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Optional mini preview / live widget under copy. */
  preview?: ReactNode;
  className?: string;
  iconClassName?: string;
};

/**
 * Numbered step card — Phase 0 DNA #5.
 * Icon chip + step number + copy + optional mini preview.
 */
export function StepCard({
  step,
  title,
  description,
  icon: Icon,
  preview,
  className,
  iconClassName,
}: StepCardProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const num = String(step).padStart(2, "0");

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn("h-full", className)}
    >
      <Card variant="default" radius="xl" className="flex h-full flex-col">
        <CardHeader className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <CardIcon className={iconClassName}>
              <Icon className="size-5" aria-hidden />
            </CardIcon>
            <span className="select-none font-display text-3xl font-bold tabular-nums text-accent/25">
              {num}
            </span>
          </div>
          <CardTitle className="font-display text-xl">{title}</CardTitle>
          <CardDescription className="mt-2 leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        {preview ? (
          <div className="border-t border-border bg-muted/40 px-6 py-4">
            {preview}
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}

export type StepCardGridProps = {
  steps: Omit<StepCardProps, "className">[];
  className?: string;
};

export function StepCardGrid({ steps, className }: StepCardGridProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {steps.map((s) => (
        <StepCard key={s.step} {...s} />
      ))}
    </div>
  );
}
