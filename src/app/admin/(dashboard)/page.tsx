import Link from "next/link";
import {
  FileText,
  Inbox,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogPosts, contactInquiries, demoRequests } from "@/db/schema";
import { AdminContentWithSidebar } from "@/components/admin/AdminContentWithSidebar";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { demoRequestStatusVariant } from "@/lib/status-variants";

const quickActions = [
  { href: "/admin/demo-requests", label: "Demo requests" },
  { href: "/admin/contact-inquiries", label: "Contact inquiries" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/modules", label: "Modules" },
  { href: "/admin/solutions", label: "Solutions" },
  { href: "/admin/home-hero", label: "Home hero" },
  { href: "/admin/site-settings", label: "Site settings" },
] as const;

export default async function AdminDashboardPage() {
  const db = await getDb();
  const [
    [{ value: demoRequestCount }],
    [{ value: contactInquiryCount }],
    [{ value: publishedBlogCount }],
    [{ value: newDemoCount }],
    recentDemos,
  ] = await Promise.all([
    db.select({ value: count() }).from(demoRequests),
    db.select({ value: count() }).from(contactInquiries),
    db
      .select({ value: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "PUBLISHED")),
    db
      .select({ value: count() })
      .from(demoRequests)
      .where(eq(demoRequests.status, "NEW")),
    db
      .select({
        id: demoRequests.id,
        name: demoRequests.name,
        email: demoRequests.email,
        company: demoRequests.company,
        businessType: demoRequests.businessType,
        country: demoRequests.country,
        status: demoRequests.status,
        createdAt: demoRequests.createdAt,
      })
      .from(demoRequests)
      .orderBy(desc(demoRequests.createdAt))
      .limit(8),
  ]);

  const totalLeads = demoRequestCount + contactInquiryCount;

  return (
    <AdminPage>
      <AdminPageHeader
        title="Dashboard"
        description="Manage marketing content and inbound leads."
      />

      <AdminStatGrid>
        <StatCard
          icon={<Inbox className="h-5 w-5" />}
          label="Total leads"
          value={totalLeads}
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Demo requests"
          value={demoRequestCount}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Pages live"
          value={publishedBlogCount}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="New demos"
          value={newDemoCount}
        />
      </AdminStatGrid>

      <AdminContentWithSidebar
        sidebar={
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-3">
              <ul className="grid grid-cols-2 gap-0 md:grid-cols-1">
                {quickActions.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted sm:px-6"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        }
      >
        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="text-base">Recent demo requests</CardTitle>
            <Link
              href="/admin/demo-requests"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentDemos.length === 0 ? (
              <EmptyState
                title="No demo requests yet"
                description="Inbound demo form submissions will appear here."
              />
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[36rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email / company</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Business
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDemos.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="break-all">{r.email}</p>
                            {r.company ? (
                              <p className="text-xs text-muted-foreground">
                                {r.company}
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {r.businessType}
                          {r.country ? (
                            <span className="text-muted-foreground">
                              {" "}
                              · {r.country}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={demoRequestStatusVariant[r.status]}
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminContentWithSidebar>
    </AdminPage>
  );
}
