"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary:
          "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        /** Light fill for use on DarkCtaBand (band stays dark in both themes) */
        inverse:
          "bg-white text-neutral-950 hover:bg-neutral-100 shadow-sm",
        "inverse-secondary":
          "border border-white/30 bg-transparent text-white hover:bg-white/10",
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

export type MarketingButtonProps = React.ComponentProps<"button"> &
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
  const classes = cn(marketingButtonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type="button"
      className={classes}
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
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ArrowRight className="size-4 shrink-0" />
          </motion.span>
        ) : null}
      </span>
    </button>
  );
}

export { marketingButtonVariants };
