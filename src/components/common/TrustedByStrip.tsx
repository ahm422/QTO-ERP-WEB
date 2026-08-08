import Link from "next/link";
import { cn } from "@/lib/utils";

export type TrustedByLogo = {
  name: string;
  /** Optional display override (e.g. monogram). Defaults to name. */
  label?: string;
  /** Optional R2 / media URL — when set, render image instead of text. */
  imageUrl?: string | null;
  /** Optional wrap link (internal or external). */
  href?: string | null;
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
        <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-80 sm:gap-x-14">
        {logos.map((logo) => {
          const content = logo.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- R2 media URLs; next/image not required for CMS logos
            <img
              src={logo.imageUrl}
              alt={logo.label ?? logo.name}
              className="h-7 w-auto max-w-[7.5rem] object-contain sm:h-8"
            />
          ) : (
            <span className="font-display text-sm font-semibold tracking-wide text-muted-foreground sm:text-base">
              {logo.label ?? logo.name}
            </span>
          );

          const inner = logo.href ? (
            logo.href.startsWith("http") ? (
              <a
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-100"
              >
                {content}
              </a>
            ) : (
              <Link
                href={logo.href}
                className="transition-opacity hover:opacity-100"
              >
                {content}
              </Link>
            )
          ) : (
            content
          );

          return (
            <li
              key={logo.name}
              className="font-display text-sm font-semibold tracking-wide text-muted-foreground sm:text-base"
            >
              {inner}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
