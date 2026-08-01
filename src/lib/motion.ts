/**
 * Shared marketing motion presets (Phase 3 / #101).
 *
 * Reduced-motion contract:
 * - Prefer `useReducedMotion()` from framer-motion in client components, or
 *   pass `getMotionSafeVariants(reduced, variants)` / the `*Safe` helpers below.
 * - When reduced: no y/x travel, no scale hover/tap, no looping pulse, no rotate
 *   icon swap — opacity-only or static. Do not reinvent these checks per page.
 *
 * Phase 4 decision: no Framer mouse-tilt and no react-three-fiber / Three.js
 * unless product explicitly requests a true 3D hero (separate issue + deps review).
 */

import type { Transition, Variants } from "framer-motion";

/** Shared viewport for scroll-reveal — fire once, slightly before fully in view */
export const viewportOnce = {
  once: true,
  margin: "-80px",
} as const;

/** Snappy spring used by buttons, cards, icon chips */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

/** Opacity + slight rise — section headers, cards entering view */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

/** Opacity only — safer default under reduced motion */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: easeOut },
  },
};

/** Parent for staggered children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Child of staggerContainer — same travel as fadeInUp */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

/** AnimatePresence enter/exit for selector / tab detail panels */
export const panelSwap: Variants = {
  initial: { opacity: 0, x: 12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: easeOut },
  },
  exit: {
    opacity: 0,
    x: -8,
    transition: { duration: 0.18, ease: easeOut },
  },
};

/** ThemeToggle sun ↔ moon */
export const iconSwap: Variants = {
  initial: { opacity: 0, rotate: -90, scale: 0.6 },
  animate: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.25, ease: easeOut },
  },
  exit: {
    opacity: 0,
    rotate: 90,
    scale: 0.6,
    transition: { duration: 0.18, ease: easeOut },
  },
};

/** Card whileHover — slight lift + scale; pair with CSS border/shadow tokens only */
export const cardHover = {
  scale: 1.03,
  y: -4,
  transition: springSnappy,
} as const;

/** Icon chip whileHover inside a card */
export const iconChipHover = {
  scale: 1.08,
  transition: springSnappy,
} as const;

/** Button whileTap press scale */
export const buttonTap = {
  scale: 0.97,
} as const;

/** Instant / no-op variants when prefers-reduced-motion */
export const instantVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

/**
 * Strip travel/scale from a variants map when reduced-motion is on.
 * Keeps opacity transitions only (or fully instant if no opacity keys).
 */
export function getMotionSafeVariants(
  reduced: boolean | null,
  variants: Variants
): Variants {
  if (!reduced) return variants;

  const safe: Variants = {};
  for (const [key, value] of Object.entries(variants)) {
    if (typeof value === "function") {
      safe[key] = value;
      continue;
    }
    if (value == null || typeof value !== "object") {
      safe[key] = value;
      continue;
    }
    const { opacity, transition } = value as {
      opacity?: number;
      transition?: Transition;
    };
    safe[key] = {
      opacity: opacity ?? 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: transition
        ? { ...transition, duration: 0.01 }
        : { duration: 0.01 },
    };
  }
  return safe;
}

/** Convenience: fadeInUp that collapses under reduced motion */
export function getFadeInUp(reduced: boolean | null): Variants {
  return getMotionSafeVariants(reduced, fadeInUp);
}

export function getStaggerContainer(reduced: boolean | null): Variants {
  if (!reduced) return staggerContainer;
  return {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0, delayChildren: 0 },
    },
  };
}

export function getStaggerItem(reduced: boolean | null): Variants {
  return getMotionSafeVariants(reduced, staggerItem);
}

export function getPanelSwap(reduced: boolean | null): Variants {
  return getMotionSafeVariants(reduced, panelSwap);
}

export function getIconSwap(reduced: boolean | null): Variants {
  return getMotionSafeVariants(reduced, iconSwap);
}

/** Hover/tap targets — return undefined so Framer skips the gesture when reduced */
export function getCardHover(reduced: boolean | null) {
  return reduced ? undefined : cardHover;
}

export function getIconChipHover(reduced: boolean | null) {
  return reduced ? undefined : iconChipHover;
}

export function getButtonTap(reduced: boolean | null) {
  return reduced ? undefined : buttonTap;
}
