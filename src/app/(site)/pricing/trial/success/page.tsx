import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { MarketingButton } from "@/components/ui/marketing-button";
import { getTrialPeriodDays } from "@/lib/trial";

export const metadata: Metadata = {
  title: "Trial started",
  description:
    "Your free trial is active. You will not be charged until the trial ends.",
};

export default function TrialSuccessPage() {
  const trialDays = getTrialPeriodDays();

  return (
    <main className="min-h-[70vh] bg-background section-padding">
      <div className="container-main mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-8" aria-hidden />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Your free trial has started
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          You will not be charged today. Your {trialDays}-day trial is active,
          and billing starts when the trial ends. You can cancel anytime before
          then from the email Stripe sends you, or from the billing portal.
        </p>
        <div className="mt-8 flex justify-center">
          <MarketingButton asChild>
            <Link href="/pricing">Back to pricing</Link>
          </MarketingButton>
        </div>
      </div>
    </main>
  );
}
