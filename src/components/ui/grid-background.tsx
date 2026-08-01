import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type GridBackgroundProps = {
  children?: ReactNode;
  className?: string;
  /** Opacity of the decorative texture layer (0–1). Default 0.4 */
  opacity?: number;
};

/**
 * Relative container with a soft radial-dot texture behind content.
 * Texture layer is pointer-events-none so children remain clickable.
 */
export function GridBackground({
  children,
  className,
  opacity = 0.4,
}: GridBackgroundProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        style={{ opacity }}
      >
        <div
          className="absolute inset-0 text-foreground"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
          }}
        />
      </div>
      {children != null ? (
        <div className="relative z-10">{children}</div>
      ) : null}
    </div>
  );
}
