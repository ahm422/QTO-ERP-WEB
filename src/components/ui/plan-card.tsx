"use client";

import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { annualDiscountPercent } from "@/lib/pricing-discount";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/types/pricingPlan";
import { Card } from "@/components/ui/card";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { MarketingButton } from "@/components/ui/marketing-button";

export type PlanCardProps = {
  plan: PricingPlan;
  yearly: boolean;
  /** When true, primary CTA starts a trial and secondary CTA starts paid checkout. */
  checkoutEnabled?: boolean;
  trialLoading?: boolean;
  subscribeLoading?: boolean;
  error?: string;
  onStartTrial?: (slug: string) => void;
  onSubscribe?: (slug: string) => void;
  className?: string;
};

/**
 * Pricing plan card primitive — board DNA (accent popular border, orange checks).
 * Checkout orchestration stays at the page / PricingCards layer.
 */
export function PlanCard({
  plan,
  yearly,
  checkoutEnabled = false,
  trialLoading = false,
  subscribeLoading = false,
  error,
  onStartTrial,
  onSubscribe,
  className,
}: PlanCardProps) {
  const isPopular = plan.popular;
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const showCustom =
    typeof price !== "number" || Number.isNaN(price) || price <= 0;
  const savePercent = yearly
    ? annualDiscountPercent(plan.monthlyPrice, plan.yearlyPrice)
    : null;
  const showAnnualSave = savePercent !== null && savePercent >= 1;

  return (
    <Card
      variant="interactive"
      radius="xl"
      padding="none"
      className={cn(
        "flex h-full flex-col overflow-hidden",
        isPopular && "border-accent ring-1 ring-accent/25",
        className
      )}
    >
      {isPopular ? <div className="h-1.5 w-full bg-accent" /> : null}

      <div className="flex h-full flex-col p-6 md:p-8">
        <div className="mb-6">
          {isPopular ? (
            <div className="mb-4">
              <EyebrowBadge
                icon={Sparkles}
                label="Most Popular"
                variant="accent"
              />
            </div>
          ) : null}

          <div className="mb-2 flex items-center gap-2">
            {!isPopular ? (
              <Zap className="size-5 text-muted-foreground" aria-hidden />
            ) : null}
            <h3 className="font-display text-xl font-bold text-foreground">
              {plan.name}
            </h3>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {plan.description}
          </p>
        </div>

        <div className="mb-6">
          {showCustom ? (
            <span className="font-display text-4xl font-bold tracking-tight text-foreground">
              Custom
            </span>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold tracking-tight text-foreground">
                  ${price}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  /mo
                </span>
              </div>
              {showAnnualSave ? (
                <>
                  <span
                    className="text-sm font-medium text-muted-foreground line-through"
                    aria-hidden
                  >
                    ${plan.monthlyPrice}/mo
                  </span>
                  <span className="sr-only">
                    instead of ${plan.monthlyPrice} per month
                  </span>
                  <span
                    className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent"
                    aria-label={`Save ${savePercent} percent billed annually`}
                  >
                    Save {savePercent}%
                  </span>
                </>
              ) : null}
            </div>
          )}
          {!showCustom ? (
            <p className="mt-1 text-xs text-muted-foreground">
              per user, billed {yearly ? "yearly" : "monthly"}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Talk to sales for volume pricing
            </p>
          )}
        </div>

        <div className="mb-8">
          {checkoutEnabled && (onStartTrial || onSubscribe) ? (
            <div className="space-y-2">
              {onStartTrial ? (
                <MarketingButton
                  type="button"
                  onClick={() => onStartTrial(plan.slug)}
                  disabled={trialLoading || subscribeLoading}
                  variant={isPopular ? "primary" : "secondary"}
                  className="w-full"
                  iconSlide={!trialLoading}
                >
                  {trialLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Processing…
                    </>
                  ) : /trial/i.test(plan.cta) ? (
                    plan.cta
                  ) : (
                    "Start Free Trial"
                  )}
                </MarketingButton>
              ) : null}
              {onSubscribe ? (
                <MarketingButton
                  type="button"
                  onClick={() => onSubscribe(plan.slug)}
                  disabled={trialLoading || subscribeLoading}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  iconSlide={false}
                >
                  {subscribeLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Processing…
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </MarketingButton>
              ) : null}
            </div>
          ) : (
            <MarketingButton
              variant={isPopular ? "primary" : "secondary"}
              className="mb-2 w-full"
              asChild
            >
              <Link href="/contact">{plan.cta}</Link>
            </MarketingButton>
          )}
          {error ? (
            <p className="mt-2 text-center text-xs text-destructive">{error}</p>
          ) : null}
        </div>

        <div className="mb-6 h-px bg-border" />

        <div className="flex-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What&apos;s included
          </p>
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                    isPopular
                      ? "bg-accent/15 text-accent"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </div>
                <span className="leading-relaxed text-foreground/90">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
