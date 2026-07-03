import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const sections = [
  { href: "/admin/demo-requests", label: "Demo requests" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/demo-videos", label: "Demo videos" },
  { href: "/admin/comparison", label: "Comparison" },
];

export default async function AdminDashboardPage() {
  const prisma = getPrisma();
  const [demoRequests, blogPosts, pricingPlans, demoVideos, comparisonRows] =
    await Promise.all([
      prisma.demoRequest.count(),
      prisma.blogPost.count(),
      prisma.pricingPlan.count(),
      prisma.demoVideo.count(),
      prisma.comparisonFeature.count(),
    ]);

  const counts = [
    { label: "Demo requests", value: demoRequests },
    { label: "Blog posts", value: blogPosts },
    { label: "Pricing plans", value: pricingPlans },
    { label: "Demo videos", value: demoVideos },
    { label: "Comparison rows", value: comparisonRows },
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
