import { cn } from "@/lib/utils";

export type TrustedByLogo = {
  name: string;
  /** Optional display override (e.g. monogram). Defaults to name. */
  label?: string;
};

export type TrustedByStripProps = {
  logos: TrustedByLogo[];
  /** Optional eyebrow above the strip. */
  label?: string;
  className?: string;
};

/**
 * Static trust / logo strip for marketing home (board: TrustedByStrip).
 * Prefer this for a calm 5-across row; use ClientsMarquee when motion is desired.
 */
export function TrustedByStrip({
  logos,
  label = "Trusted by teams building in the field",
  className,
}: TrustedByStripProps) {
  if (logos.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
        {logos.map((logo) => (
          <li
            key={logo.name}
            className="font-display text-sm font-semibold tracking-wide text-muted-foreground/80 sm:text-base"
          >
            {logo.label ?? logo.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
