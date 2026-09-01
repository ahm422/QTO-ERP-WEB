"use client";

/**
 * The single scroll-in wrapper for the marketing site (Phase 7.2). Replaces the
 * ad-hoc `motion.div initial="hidden" whileInView="visible" viewport={viewportOnce}`
 * pattern that was copied across ~40 files. Fully respects `prefers-reduced-motion`
 * via the shared `getFadeInUp` helper (opacity-only when reduced).
 */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from "@/lib/motion";

type Tag = "div" | "section" | "ul" | "li" | "article" | "header";

const MOTION_TAG = {
  div: motion.div,
  section: motion.section,
  ul: motion.ul,
  li: motion.li,
  article: motion.article,
  header: motion.header,
} as const;

type RevealProps = {
  children: ReactNode;
  as?: Tag;
  className?: string;
  /** Seconds to delay the reveal (ignored under reduced motion). */
  delay?: number;
  /**
   * When true, children animate in with a stagger — direct children should be
   * <Reveal.Item> to inherit the per-item variant.
   */
  stagger?: boolean;
};

export function Reveal({
  children,
  as = "div",
  className,
  delay = 0,
  stagger = false,
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = MOTION_TAG[as];

  return (
    <MotionTag
      className={className}
      variants={stagger ? getStaggerContainer(reduced) : getFadeInUp(reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={reduced || !delay || stagger ? undefined : { delay }}
    >
      {children}
    </MotionTag>
  );
}

function RevealItem({
  children,
  as = "div",
  className,
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const MotionTag = MOTION_TAG[as];
  return (
    <MotionTag className={className} variants={getStaggerItem(reduced)}>
      {children}
    </MotionTag>
  );
}

Reveal.Item = RevealItem;
