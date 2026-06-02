"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ComparisonRow = {
  id: string;
  feature: string;
  starter: string;
  growth: string;
  enterprise: string;
  sortOrder: number;
  published: boolean;
};

type DraftRow = Omit<ComparisonRow, "id"> & { id?: string };

const emptyRow = (): DraftRow => ({
  feature: "",
  starter: "",
  growth: "",
  enterprise: "",
  sortOrder: 0,
  published: true,
});

export default function ComparisonAdminPage() {
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<DraftRow>(emptyRow());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; features: ComparisonRow[] }>(
        "/api/admin/comparison",
      );
      setRows(data.features);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load rows",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveRow = async (row: ComparisonRow) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; feature: ComparisonRow }>(
        `/api/admin/comparison/${row.id}`,
        {
          method: "PATCH",
          json: {
            feature: row.feature,
            starter: row.starter,
            growth: row.growth,
            enterprise: row.enterprise,
            sortOrder: row.sortOrder,
            published: row.published,
          },
        },
      );
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? data.feature : r)),
      );
      toast.success("Row saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save row",
      );
    } finally {
      setSavingId(null);
    }
  };

  const createRow = async () => {
    try {
      const data = await adminFetch<{ ok: true; feature: ComparisonRow }>(
        "/api/admin/comparison",
        { method: "POST", json: newRow },
      );
      setRows((prev) => [...prev, data.feature]);
      setNewRow(emptyRow());
      toast.success("Row created");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to create row",
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/comparison/${deleteId}`, {
        method: "DELETE",
      });
      setRows((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success("Row deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to delete row",
      );
    } finally {
      setDeleting(false);
    }
  };

  const updateLocal = (
    id: string,
    field: keyof ComparisonRow,
    value: string | number | boolean,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Comparison table</h1>
        <p className="text-sm text-muted-foreground">
          Edit pricing comparison rows shown on the public pricing page.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Starter</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead>Enterprise</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Published</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {(
                    [
                      "feature",
                      "starter",
                      "growth",
                      "enterprise",
                    ] as const
                  ).map((field) => (
                    <TableCell key={field}>
                      <Input
                        value={row[field]}
                        onChange={(e) =>
                          updateLocal(row.id, field, e.target.value)
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Input
                      type="number"
                      className="w-20"
                      value={row.sortOrder}
                      onChange={(e) =>
                        updateLocal(row.id, "sortOrder", Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.published}
                      onCheckedChange={(v) =>
                        updateLocal(row.id, "published", v)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveRow(row)}
                        disabled={savingId === row.id}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="rounded-md border p-4 space-y-4">
        <h2 className="font-medium">Add row</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["feature", "starter", "growth", "enterprise"] as const).map(
            (field) => (
              <div key={field}>
                <Label className="capitalize">{field}</Label>
                <Input
                  className="mt-1"
                  value={newRow[field]}
                  onChange={(e) =>
                    setNewRow((r) => ({ ...r, [field]: e.target.value }))
                  }
                />
              </div>
            ),
          )}
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              className="mt-1 w-24"
              value={newRow.sortOrder}
              onChange={(e) =>
                setNewRow((r) => ({
                  ...r,
                  sortOrder: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={newRow.published}
              onCheckedChange={(v) => setNewRow((r) => ({ ...r, published: v }))}
            />
            <Label>Published</Label>
          </div>
          <Button type="button" className="mt-6" onClick={createRow}>
            Add row
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete comparison row"
        description="This row will be removed from the public pricing comparison table."
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
