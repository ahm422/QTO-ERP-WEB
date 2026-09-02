"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { useAuth } from "@/lib/auth-context";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ALLOWED_STAT_ICON_KEYS } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type HomeStatRow = {
  id: string;
  label: string;
  value: number;
  suffix: string;
  iconKey: string;
  published: boolean;
  sortOrder: number;
};

type DraftRow = {
  label: string;
  value: string;
  suffix: string;
  iconKey: string;
  published: boolean;
};

const emptyDraft = (): DraftRow => ({
  label: "",
  value: "0",
  suffix: "+",
  iconKey: "users",
  published: true,
});

function sortRows(rows: HomeStatRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function HomeStatsAdminPage() {
  const { can } = useAuth();
  const canDelete = can("content:delete");
  const [rows, setRows] = useState<HomeStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<DraftRow>(emptyDraft());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; items: HomeStatRow[] }>(
        "/api/admin/home-stats",
      );
      setRows(sortRows(data.items));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load home stats",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (
    id: string,
    field: keyof HomeStatRow,
    value: string | number | boolean,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const saveRow = async (row: HomeStatRow) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; item: HomeStatRow }>(
        `/api/admin/home-stats/${row.id}`,
        {
          method: "PATCH",
          json: {
            label: row.label,
            value: row.value,
            suffix: row.suffix,
            iconKey: row.iconKey,
            published: row.published,
            sortOrder: row.sortOrder,
          },
        },
      );
      setRows((prev) =>
        sortRows(prev.map((r) => (r.id === row.id ? data.item : r))),
      );
      toast.success("Saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save",
      );
    } finally {
      setSavingId(null);
    }
  };

  const persistOrder = async (ordered: HomeStatRow[]) => {
    const next = ordered.map((r, i) => ({ ...r, sortOrder: i }));
    setRows(next);
    try {
      await Promise.all(
        next.map((r) =>
          adminFetch(`/api/admin/home-stats/${r.id}`, {
            method: "PATCH",
            json: { sortOrder: r.sortOrder },
          }),
        ),
      );
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to reorder",
      );
      await load();
    }
  };

  const moveRow = (index: number, dir: -1 | 1) => {
    const ordered = sortRows(rows);
    const j = index + dir;
    if (j < 0 || j >= ordered.length) return;
    const swapped = [...ordered];
    const tmp = swapped[index];
    swapped[index] = swapped[j];
    swapped[j] = tmp;
    void persistOrder(swapped);
  };

  const createRow = async () => {
    const value = Number(newRow.value);
    if (!newRow.label.trim() || Number.isNaN(value)) {
      toast.error("Label and numeric value are required");
      return;
    }
    try {
      const data = await adminFetch<{ ok: true; item: HomeStatRow }>(
        "/api/admin/home-stats",
        {
          method: "POST",
          json: {
            label: newRow.label,
            value,
            suffix: newRow.suffix,
            iconKey: newRow.iconKey,
            published: newRow.published,
          },
        },
      );
      setRows((prev) => sortRows([...prev, data.item]));
      setNewRow(emptyDraft());
      toast.success("Stat created");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to create",
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/home-stats/${deleteId}`, {
        method: "DELETE",
      });
      setRows((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success("Deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to delete",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Home stats</h1>
        <p className="text-sm text-muted-foreground">
          Manage the animated stats strip on the marketing home page.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Order</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Suffix</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Published</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortRows(rows).map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell data-label="Order">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => moveRow(index, -1)}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Move down"
                        disabled={index === rows.length - 1}
                        onClick={() => moveRow(index, 1)}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell data-label="Label">
                    <Input
                      value={row.label}
                      onChange={(e) => update(row.id, "label", e.target.value)}
                    />
                  </TableCell>
                  <TableCell data-label="Value">
                    <Input
                      type="number"
                      step="any"
                      className="w-24"
                      value={row.value}
                      onChange={(e) =>
                        update(row.id, "value", Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell data-label="Suffix">
                    <Input
                      className="w-20"
                      value={row.suffix}
                      onChange={(e) => update(row.id, "suffix", e.target.value)}
                    />
                  </TableCell>
                  <TableCell data-label="Icon">
                    <select
                      value={row.iconKey}
                      onChange={(e) => update(row.id, "iconKey", e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      {ALLOWED_STAT_ICON_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell data-label="Published">
                    <Switch
                      checked={row.published}
                      onCheckedChange={(v) => update(row.id, "published", v)}
                    />
                  </TableCell>
                  <TableCell className="max-md:justify-end">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveRow(row)}
                        disabled={savingId === row.id}
                      >
                        Save
                      </Button>
                      {canDelete ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(row.id)}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="max-md:hidden" />
                <TableCell data-label="Label">
                  <Input
                    placeholder="Label"
                    value={newRow.label}
                    onChange={(e) =>
                      setNewRow((r) => ({ ...r, label: e.target.value }))
                    }
                  />
                </TableCell>
                <TableCell data-label="Value">
                  <Input
                    type="number"
                    step="any"
                    className="w-24"
                    value={newRow.value}
                    onChange={(e) =>
                      setNewRow((r) => ({ ...r, value: e.target.value }))
                    }
                  />
                </TableCell>
                <TableCell data-label="Suffix">
                  <Input
                    className="w-20"
                    value={newRow.suffix}
                    onChange={(e) =>
                      setNewRow((r) => ({ ...r, suffix: e.target.value }))
                    }
                  />
                </TableCell>
                <TableCell data-label="Icon">
                  <select
                    value={newRow.iconKey}
                    onChange={(e) =>
                      setNewRow((r) => ({ ...r, iconKey: e.target.value }))
                    }
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    {ALLOWED_STAT_ICON_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell data-label="Published">
                  <Switch
                    checked={newRow.published}
                    onCheckedChange={(v) =>
                      setNewRow((r) => ({ ...r, published: v }))
                    }
                  />
                </TableCell>
                <TableCell className="max-md:justify-end">
                  <Button type="button" size="sm" onClick={createRow}>
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {canDelete ? (
        <ConfirmDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null);
          }}
          title="Delete home stat?"
          description="This removes the stat from the home strip."
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
