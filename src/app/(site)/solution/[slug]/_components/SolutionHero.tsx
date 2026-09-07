import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { GridBackground } from "@/components/ui/grid-background";
import { MarketingButton } from "@/components/ui/marketing-button";

type SolutionHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  specificNeeds?: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  image: string | null;
  imageAlt: string | null;
  caption: string;
  /** Rendered as a "Back to …" link when an industry deep-link is active. */
  backHref?: string;
  backLabel?: string;
};

export default function SolutionHero({
  eyebrow,
  title,
  subtitle,
  specificNeeds,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  image,
  imageAlt,
  caption,
  backHref,
  backLabel,
}: SolutionHeroProps) {
  return (
    <section className="relative overflow-hidden hero-gradient section-padding">
      <GridBackground opacity={0.12} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-0 size-72 rounded-full bg-hero-glow blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-96 rounded-full bg-hero-glow-alt blur-3xl" />
      </div>

      <div className="container-main relative z-10">
        <div className="grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            {backHref ? (
              <div className="mb-4">
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 text-sm text-hero-accent hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  {backLabel}
                </Link>
              </div>
            ) : null}

            <EyebrowBadge
              icon={Sparkles}
              label={eyebrow}
              variant="hero"
              className="mb-4"
            />

            <h1 className="font-display text-4xl font-bold tracking-tight text-hero-foreground md:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-hero-muted-foreground md:text-lg">
              {subtitle}
            </p>

            {specificNeeds && specificNeeds.length > 0 ? (
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {specificNeeds.map((need) => (
                  <li
                    key={need}
                    className="flex items-center gap-2 text-sm text-hero-muted-foreground"
                  >
                    <Check
                      className="size-4 shrink-0 text-hero-accent"
                      aria-hidden
                    />
                    {need}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <MarketingButton variant="hero" size="lg" asChild>
                <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
              </MarketingButton>
              <MarketingButton
                variant="hero-secondary"
                size="lg"
                asChild
                iconSlide={false}
              >
                <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
              </MarketingButton>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-hero-chip-border bg-hero-chip p-8 shadow-[var(--card-shadow)]">
            <GridBackground
              opacity={0.2}
              className="absolute inset-0 rounded-3xl"
            />
            {image ? (
              <div className="relative z-10 aspect-4/3 overflow-hidden rounded-2xl border border-hero-chip-border">
                <MediaImage
                  src={image}
                  alt={imageAlt ?? caption}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative z-10 aspect-4/3 rounded-2xl border border-hero-chip-border bg-linear-to-br from-hero-accent/25 via-hero-glow to-transparent" />
            )}
            <p className="relative z-10 mt-4 text-center text-sm text-hero-muted-foreground">
              {caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
