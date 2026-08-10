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

type SolutionRow = {
  id: string;
  slug: string;
  title: string;
  audience: string;
  published: boolean;
  sortOrder: number;
};

export default function SolutionsAdminPage() {
  const [items, setItems] = useState<SolutionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; items: SolutionRow[] }>(
        "/api/admin/solutions",
      );
      setItems(data.items);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load solutions",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Solutions</h1>
          <p className="text-sm text-muted-foreground">
            Manage solution pages under /solution/[slug].
          </p>
        </div>
        <Button type="button" asChild>
          <Link href="/admin/solutions/new">New solution</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No solutions yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="font-mono text-sm">{row.slug}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {row.audience}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.published ? "default" : "outline"}>
                        {row.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.sortOrder}</TableCell>
                    <TableCell>
                      <Button type="button" size="sm" variant="outline" asChild>
                        <Link href={`/admin/solutions/${row.slug}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
