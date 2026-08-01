import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GridBackground } from "@/components/ui/grid-background";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import type { LucideIcon } from "lucide-react";

export type DarkCtaBandProps = {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  description?: string;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
};

/**
 * Full-bleed dark rounded CTA panel with grid texture.
 * Band stays dark in both page themes; compose actions with MarketingButton.
 */
export function DarkCtaBand({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: DarkCtaBandProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-neutral-950 text-neutral-50",
        "dark:bg-neutral-950",
        className
      )}
    >
      <GridBackground
        opacity={0.18}
        className="px-6 py-12 sm:px-10 sm:py-16 md:px-14"
      >
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-start gap-5 text-left sm:items-center sm:text-center">
          {eyebrow ? (
            <EyebrowBadge
              label={eyebrow}
              icon={eyebrowIcon}
              variant="muted"
              className="border-white/15 bg-white/10 text-neutral-200"
            />
          ) : null}

          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>

          {description ? (
            <p className="max-w-xl text-base text-neutral-300 sm:text-lg">
              {description}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-3 sm:justify-center">
            {primaryAction}
            {secondaryAction}
          </div>
        </div>
      </GridBackground>
    </div>
  );
}
