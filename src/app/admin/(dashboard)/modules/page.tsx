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

type ModuleRow = {
  id: string;
  slug: string;
  name: string;
  published: boolean;
  sortOrder: number;
  showInHeroOrbit: boolean;
};

export default function ModulesAdminPage() {
  const [items, setItems] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; items: ModuleRow[] }>(
        "/api/admin/modules",
      );
      setItems(data.items);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load modules",
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
          <h1 className="text-2xl font-semibold">ERP modules</h1>
          <p className="text-sm text-muted-foreground">
            Manage module pages under /erp/[slug].
          </p>
        </div>
        <Button type="button" asChild>
          <Link href="/admin/modules/new">New module</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Orbit</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground max-md:block"
                  >
                    No modules yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium" data-label="Name">
                      {row.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm" data-label="Slug">
                      {row.slug}
                    </TableCell>
                    <TableCell data-label="Published">
                      <Badge variant={row.published ? "default" : "outline"}>
                        {row.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell data-label="Sort">{row.sortOrder}</TableCell>
                    <TableCell data-label="Orbit">
                      {row.showInHeroOrbit ? (
                        <Badge variant="secondary">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-md:justify-end">
                      <Button type="button" size="sm" variant="outline" asChild>
                        <Link href={`/admin/modules/${row.slug}/edit`}>Edit</Link>
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
