"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ValueRow = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  sortOrder: number;
};

type DraftRow = {
  title: string;
  description: string;
  published: boolean;
};

const emptyDraft = (): DraftRow => ({
  title: "",
  description: "",
  published: true,
});

function sortRows(rows: ValueRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function AboutValuesEditor() {
  const [rows, setRows] = useState<ValueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<DraftRow>(emptyDraft());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; items: ValueRow[] }>(
        "/api/admin/about/values",
      );
      setRows(sortRows(data.items));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load about values",
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
    field: keyof ValueRow,
    value: string | number | boolean,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const saveRow = async (row: ValueRow) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; item: ValueRow }>(
        `/api/admin/about/values/${row.id}`,
        {
          method: "PUT",
          json: {
            title: row.title,
            description: row.description,
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

  const persistOrder = async (ordered: ValueRow[]) => {
    const next = ordered.map((r, i) => ({ ...r, sortOrder: i }));
    setRows(next);
    try {
      const data = await adminFetch<{ ok: true; items: ValueRow[] }>(
        "/api/admin/about/values/reorder",
        {
          method: "PUT",
          json: { ids: next.map((r) => r.id) },
        },
      );
      setRows(sortRows(data.items));
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
    if (!newRow.title.trim() || !newRow.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    try {
      const data = await adminFetch<{ ok: true; item: ValueRow }>(
        "/api/admin/about/values",
        {
          method: "POST",
          json: {
            title: newRow.title,
            description: newRow.description,
            published: newRow.published,
          },
        },
      );
      setRows((prev) => sortRows([...prev, data.item]));
      setNewRow(emptyDraft());
      toast.success("Value created");
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
      await adminFetch(`/api/admin/about/values/${deleteId}`, {
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
      <p className="text-sm text-muted-foreground">
        Manage Values cards on /about. Unpublished cards are hidden on the
        public page. Section header chrome stays hardcoded.
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Published</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortRows(rows).map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
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
                  <TableCell>
                    <Input
                      value={row.title}
                      onChange={(e) => update(row.id, "title", e.target.value)}
                      className="min-w-36"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={row.description}
                      onChange={(e) =>
                        update(row.id, "description", e.target.value)
                      }
                      rows={2}
                      className="min-w-56"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.published}
                      onCheckedChange={(checked) =>
                        update(row.id, "published", checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={savingId === row.id}
                        onClick={() => saveRow(row)}
                      >
                        {savingId === row.id ? "Saving…" : "Save"}
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

              <TableRow>
                <TableCell />
                <TableCell>
                  <Input
                    placeholder="New title"
                    value={newRow.title}
                    onChange={(e) =>
                      setNewRow((r) => ({ ...r, title: e.target.value }))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="New description"
                    rows={2}
                    value={newRow.description}
                    onChange={(e) =>
                      setNewRow((r) => ({
                        ...r,
                        description: e.target.value,
                      }))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={newRow.published}
                    onCheckedChange={(checked) =>
                      setNewRow((r) => ({ ...r, published: checked }))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button type="button" size="sm" onClick={createRow}>
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete value?"
        description="This removes the card from the about page. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
