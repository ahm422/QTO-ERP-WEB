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
          "mb-8 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success",
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
          "mb-8 flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground",
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
