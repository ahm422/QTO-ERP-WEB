"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { getButtonTap, springSnappy } from "@/lib/motion";

const marketingButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-xl text-sm font-semibold",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "transition-colors duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-sm)]",
        secondary:
          "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        /** Light fill for use on DarkCtaBand (band stays dark in both themes) */
        inverse:
          "bg-white text-neutral-950 hover:bg-neutral-100 shadow-[var(--shadow-sm)]",
        "inverse-secondary":
          "border border-white/30 bg-transparent text-white hover:bg-white/10",
        /** For hero sections, whose surface flips between light and dark with the theme */
        hero: "bg-hero-cta text-hero-cta-foreground hover:opacity-90 shadow-[var(--shadow-sm)]",
        "hero-secondary":
          "border border-hero-chip-border bg-transparent text-hero-foreground hover:bg-hero-chip",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export type MarketingButtonProps = Omit<
  React.ComponentProps<"button">,
  "onAnimationStart" | "onAnimationEnd" | "onDragStart" | "onDragEnd" | "onDrag"
> &
  VariantProps<typeof marketingButtonVariants> & {
    asChild?: boolean;
    /** Show trailing arrow that slides right on hover. Default true. */
    iconSlide?: boolean;
  };

/**
 * Marketing CTA button — solid dark primary / outline secondary with Framer Motion icon-slide.
 * Distinct from brand gold `Button variant="default"`.
 */
export function MarketingButton({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  iconSlide = true,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: MarketingButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const reduced = useReducedMotion();
  const tap = getButtonTap(reduced);
  const classes = cn(marketingButtonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <motion.button
      type="button"
      className={classes}
      whileTap={tap}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {iconSlide ? (
          <motion.span
            aria-hidden="true"
            className="inline-flex"
            initial={false}
            animate={{ x: !reduced && hovered ? 4 : 0 }}
            transition={springSnappy}
          >
            <ArrowRight className="size-4 shrink-0" />
          </motion.span>
        ) : null}
      </span>
    </motion.button>
  );
}

export { marketingButtonVariants };
