import Link from "next/link";
import { count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  blogPosts,
  comparisonFeatures,
  demoRequests,
  demoVideos,
  pricingPlans,
} from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const sections = [
  { href: "/admin/demo-requests", label: "Demo requests" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/demo-videos", label: "Demo videos" },
  { href: "/admin/comparison", label: "Comparison" },
];

export default async function AdminDashboardPage() {
  const db = await getDb();
  const [
    [{ value: demoRequestCount }],
    [{ value: blogPostCount }],
    [{ value: pricingPlanCount }],
    [{ value: demoVideoCount }],
    [{ value: comparisonRowCount }],
  ] = await Promise.all([
    db.select({ value: count() }).from(demoRequests),
    db.select({ value: count() }).from(blogPosts),
    db.select({ value: count() }).from(pricingPlans),
    db.select({ value: count() }).from(demoVideos),
    db.select({ value: count() }).from(comparisonFeatures),
  ]);

  const counts = [
    { label: "Demo requests", value: demoRequestCount },
    { label: "Blog posts", value: blogPostCount },
    { label: "Pricing plans", value: pricingPlanCount },
    { label: "Demo videos", value: demoVideoCount },
    { label: "Comparison rows", value: comparisonRowCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage marketing content and inbound leads.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Quick links</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {sections.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-muted"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
