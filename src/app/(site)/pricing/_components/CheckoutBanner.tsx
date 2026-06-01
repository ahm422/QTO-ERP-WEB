"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutBanner() {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");

  if (checkout === "success") {
    return (
      <div
        className={cn(
          "mb-8 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900",
          "dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100",
        )}
        role="status"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p>
          Payment successful. Your subscription is being activated — you will
          receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  if (checkout === "cancelled") {
    return (
      <div
        className={cn(
          "mb-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700",
          "dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
        )}
        role="status"
      >
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p>Checkout was cancelled. You can try again when you are ready.</p>
      </div>
    );
  }

  return null;
}
