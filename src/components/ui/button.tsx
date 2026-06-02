import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 shrink-0",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    "relative overflow-hidden",
    "transition-all duration-300 ease-out",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-accent text-accent-foreground font-semibold rounded-md",
          "shadow-[0_2px_12px_hsl(44_90%_50%/0.25)]",
          "hover:shadow-[0_4px_20px_hsl(44_90%_50%/0.5)] hover:brightness-105",
          "active:scale-[0.97]",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
          "before:-translate-x-full before:skew-x-12",
          "hover:before:translate-x-full",
          "before:transition-transform before:duration-700 before:ease-in-out",
        ].join(" "),

        destructive: [
          "bg-destructive text-white rounded-xl font-semibold",
          "shadow-[0_2px_12px_oklch(0.577_0.245_27.325/0.3)]",
          "hover:bg-destructive/90 hover:shadow-[0_4px_20px_oklch(0.577_0.245_27.325/0.5)]",
          "active:scale-[0.97]",
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent",
          "before:-translate-x-full before:skew-x-12",
          "hover:before:translate-x-full",
          "before:transition-transform before:duration-700 before:ease-in-out",
        ].join(" "),

        navbar:
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left " +
          "hover:bg-accent/10 hover:text-accent transition-colors duration-200",

        outline: [
          "border border-border bg-background text-foreground",
          "shadow-xs dark:bg-input/30 dark:border-input",
          "hover:text-accent-foreground hover:border-accent",
          "active:scale-[0.97]",
          "before:absolute before:inset-x-0 before:bottom-0 before:h-0",
          "before:bg-accent/15 dark:before:bg-accent/20",
          "before:transition-[height] before:duration-300 before:ease-out",
          "hover:before:h-full",
        ].join(" "),

        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-[inset_0_0_0_0_hsl(44_90%_50%/0)]",
          "hover:bg-secondary/70",
          "hover:shadow-[inset_0_0_14px_2px_hsl(44_90%_50%/0.12)]",
          "active:scale-[0.97] active:shadow-[inset_0_0_20px_4px_hsl(44_90%_50%/0.18)]",
        ].join(" "),

        ghost: [
          "text-foreground",
          "hover:text-accent",
          "active:scale-[0.97]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-[radial-gradient(ellipse_at_center,hsl(44_90%_50%/0.18)_0%,transparent_70%)]",
          "before:scale-0 before:opacity-0",
          "hover:before:scale-100 hover:before:opacity-100",
          "before:transition-[transform,opacity] before:duration-300 before:ease-out",
          "dark:hover:bg-accent/10",
        ].join(" "),

        link: [
          "text-primary underline-offset-4",
          "hover:text-accent",
          "after:absolute after:bottom-0.5 after:left-0",
          "after:h-[1.5px] after:w-0 after:rounded-full after:bg-accent",
          "hover:after:w-full",
          "after:transition-[width] after:duration-300 after:ease-out",
        ].join(" "),
      },

      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-4",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Accepts any Lucide icon component (or any React component that renders an svg)
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Lucide icon component, e.g. icon={Search} */
  icon?: IconComponent
  /** Position of the icon relative to the label. Defaults to "left". */
  iconPosition?: "right" | "left"
  /** Custom class applied to the icon element */
  iconClassName?: string
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  icon: Icon,
  iconPosition = "right",
  iconClassName,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  const iconEl = Icon ? (
    <Icon
      aria-hidden="true"
      className={cn("pointer-events-none shrink-0", iconClassName)}
    />
  ) : null

  // Slot (asChild) requires exactly one React element child.
  if (asChild) {
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps, IconComponent }