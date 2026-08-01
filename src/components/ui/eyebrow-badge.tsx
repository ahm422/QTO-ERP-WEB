import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const eyebrowBadgeVariants = cva(
  [
    "inline-flex items-center gap-2 rounded-full border px-3 py-1",
    "text-[11px] font-semibold uppercase tracking-widest",
  ].join(" "),
  {
    variants: {
      variant: {
        muted:
          "border-border bg-muted text-muted-foreground",
        accent:
          "border-accent/25 bg-accent/10 text-accent",
      },
    },
    defaultVariants: {
      variant: "muted",
    },
  }
);

export type EyebrowBadgeProps = ComponentProps<"span"> &
  VariantProps<typeof eyebrowBadgeVariants> & {
    icon?: LucideIcon;
    label: string;
  };

/**
 * Marketing section eyebrow — pill + leading Lucide icon + uppercase tracked label.
 * Separate from admin `Badge` status variants.
 */
export function EyebrowBadge({
  className,
  variant,
  icon: Icon,
  label,
  ...props
}: EyebrowBadgeProps) {
  return (
    <span
      data-slot="eyebrow-badge"
      className={cn(eyebrowBadgeVariants({ variant }), className)}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5 shrink-0" /> : null}
      {label}
    </span>
  );
}

export { eyebrowBadgeVariants };
