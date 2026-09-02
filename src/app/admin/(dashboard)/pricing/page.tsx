"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PricingPlan = {
  id: string;
  slug: string;
  name: string;
  monthlyPriceDisplay: number;
  yearlyPriceDisplay: number;
  popular: boolean;
  published: boolean;
  sortOrder: number;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
};

export default function PricingAdminPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; plans: PricingPlan[] }>(
        "/api/admin/pricing/plans",
      );
      setPlans(data.plans);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load plans",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pricing plans</h1>
        <p className="text-sm text-muted-foreground">
          Edit plan copy, features, and Stripe price IDs. See{" "}
          <code className="text-xs">docs/payments.md</code>{" "}
          and run <code className="text-xs">npm run stripe:check</code>.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Yearly</TableHead>
                <TableHead>Stripe IDs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => {
                const missingStripe =
                  !plan.stripePriceIdMonthly || !plan.stripePriceIdYearly;
                return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-mono text-sm" data-label="Slug">
                      {plan.slug}
                    </TableCell>
                    <TableCell className="font-medium" data-label="Name">
                      {plan.name}
                      {plan.popular && (
                        <Badge className="ml-2" variant="secondary">
                          Popular
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell data-label="Monthly">
                      ${plan.monthlyPriceDisplay}
                    </TableCell>
                    <TableCell data-label="Yearly">
                      ${plan.yearlyPriceDisplay}
                    </TableCell>
                    <TableCell data-label="Stripe IDs">
                      {missingStripe ? (
                        <Badge variant="destructive">Missing Stripe IDs</Badge>
                      ) : (
                        <Badge variant="outline">Configured</Badge>
                      )}
                    </TableCell>
                    <TableCell data-label="Status">
                      <Badge variant={plan.published ? "default" : "outline"}>
                        {plan.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-md:justify-end">
                      <Button type="button" size="sm" variant="outline" asChild>
                        <Link href={`/admin/pricing/${plan.slug}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
