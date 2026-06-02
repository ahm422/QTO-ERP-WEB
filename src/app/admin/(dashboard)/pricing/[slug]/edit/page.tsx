"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type PricingPlan = {
  slug: string;
  name: string;
  description: string;
  monthlyPriceDisplay: number;
  yearlyPriceDisplay: number;
  popular: boolean;
  features: string[];
  cta: string;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  sortOrder: number;
  published: boolean;
};

export default function EditPricingPlanPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [plan, setPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; plans: PricingPlan[] }>(
        "/api/admin/pricing/plans",
      );
      const found = data.plans.find((p) => p.slug === slug);
      if (!found) {
        toast.error("Plan not found");
        return;
      }
      setPlan(found);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load plan",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const data = await adminFetch<{ ok: true; plan: PricingPlan }>(
        `/api/admin/pricing/plans/${slug}`,
        {
          method: "PATCH",
          json: {
            name: plan.name,
            description: plan.description,
            monthlyPriceDisplay: plan.monthlyPriceDisplay,
            yearlyPriceDisplay: plan.yearlyPriceDisplay,
            popular: plan.popular,
            features: plan.features,
            cta: plan.cta,
            stripePriceIdMonthly: plan.stripePriceIdMonthly || null,
            stripePriceIdYearly: plan.stripePriceIdYearly || null,
            sortOrder: plan.sortOrder,
            published: plan.published,
          },
        },
      );
      setPlan(data.plan);
      toast.success("Plan saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save plan",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !plan) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const missingStripe =
    !plan.stripePriceIdMonthly || !plan.stripePriceIdYearly;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit {plan.name}</h1>
          <p className="font-mono text-sm text-muted-foreground">{plan.slug}</p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/pricing">Back</Link>
        </Button>
      </div>

      {missingStripe && (
        <Badge variant="destructive">
          Stripe price IDs missing — checkout may fail for this plan
        </Badge>
      )}

      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            className="mt-1"
            value={plan.name}
            onChange={(e) => setPlan({ ...plan, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            className="mt-1"
            value={plan.description}
            onChange={(e) => setPlan({ ...plan, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Monthly price display ($)</Label>
            <Input
              type="number"
              className="mt-1"
              value={plan.monthlyPriceDisplay}
              onChange={(e) =>
                setPlan({
                  ...plan,
                  monthlyPriceDisplay: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Yearly price display ($)</Label>
            <Input
              type="number"
              className="mt-1"
              value={plan.yearlyPriceDisplay}
              onChange={(e) =>
                setPlan({
                  ...plan,
                  yearlyPriceDisplay: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <div>
          <Label>CTA label</Label>
          <Input
            className="mt-1"
            value={plan.cta}
            onChange={(e) => setPlan({ ...plan, cta: e.target.value })}
          />
        </div>
        <div>
          <Label>Stripe monthly price ID</Label>
          <Input
            className="mt-1 font-mono text-sm"
            value={plan.stripePriceIdMonthly ?? ""}
            onChange={(e) =>
              setPlan({
                ...plan,
                stripePriceIdMonthly: e.target.value || null,
              })
            }
            placeholder="price_..."
          />
        </div>
        <div>
          <Label>Stripe yearly price ID</Label>
          <Input
            className="mt-1 font-mono text-sm"
            value={plan.stripePriceIdYearly ?? ""}
            onChange={(e) =>
              setPlan({
                ...plan,
                stripePriceIdYearly: e.target.value || null,
              })
            }
            placeholder="price_..."
          />
        </div>
        <div>
          <Label>Sort order</Label>
          <Input
            type="number"
            className="mt-1 w-24"
            value={plan.sortOrder}
            onChange={(e) =>
              setPlan({ ...plan, sortOrder: Number(e.target.value) })
            }
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={plan.popular}
              onCheckedChange={(v) => setPlan({ ...plan, popular: v })}
            />
            <Label>Popular</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={plan.published}
              onCheckedChange={(v) => setPlan({ ...plan, published: v })}
            />
            <Label>Published</Label>
          </div>
        </div>

        <div>
          <Label>Features</Label>
          <ul className="mt-2 space-y-2">
            {plan.features.map((f, i) => (
              <li key={i} className="flex gap-2">
                <Input
                  value={f}
                  onChange={(e) => {
                    const features = [...plan.features];
                    features[i] = e.target.value;
                    setPlan({ ...plan, features });
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPlan({
                      ...plan,
                      features: plan.features.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="New feature"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!newFeature.trim()) return;
                setPlan({
                  ...plan,
                  features: [...plan.features, newFeature.trim()],
                });
                setNewFeature("");
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save plan"}
        </Button>
      </div>
    </div>
  );
}
