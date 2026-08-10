"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { ALLOWED_CONTACT_ICON_KEYS } from "@/lib/icon-map";
import type { ContactChannel } from "@/types/content";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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

type DraftChannel = {
  type: string;
  label: string;
  value: string;
  iconKey: string;
  published: boolean;
};

const emptyDraft = (): DraftChannel => ({
  type: "email",
  label: "",
  value: "",
  iconKey: "mail",
  published: true,
});

function sortRows(rows: ContactChannel[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function ContactChannelsEditor() {
  const [rows, setRows] = useState<ContactChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<DraftChannel>(emptyDraft());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; channels: ContactChannel[] }>(
        "/api/admin/contact/channels",
      );
      setRows(sortRows(data.channels));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load channels",
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
    field: keyof ContactChannel,
    value: string | number | boolean,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const saveRow = async (row: ContactChannel) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; channel: ContactChannel }>(
        `/api/admin/contact/channels/${row.id}`,
        {
          method: "PATCH",
          json: {
            type: row.type,
            label: row.label,
            value: row.value,
            iconKey: row.iconKey,
            published: row.published,
          },
        },
      );
      setRows((prev) =>
        sortRows(prev.map((r) => (r.id === row.id ? data.channel : r))),
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

  const persistOrder = async (ordered: ContactChannel[]) => {
    const next = ordered.map((r, i) => ({ ...r, sortOrder: i }));
    setRows(next);
    try {
      await adminFetch("/api/admin/contact/channels/reorder", {
        method: "POST",
        json: { orderedIds: next.map((r) => r.id) },
      });
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
    if (!newRow.label.trim() || !newRow.value.trim()) {
      toast.error("Label and value are required");
      return;
    }
    try {
      const data = await adminFetch<{ ok: true; channel: ContactChannel }>(
        "/api/admin/contact/channels",
        { method: "POST", json: newRow },
      );
      setRows((prev) => sortRows([...prev, data.channel]));
      setNewRow(emptyDraft());
      toast.success("Channel created");
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
      await adminFetch(`/api/admin/contact/channels/${deleteId}`, {
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

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Order</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Icon</TableHead>
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
                    value={row.type}
                    onChange={(e) => update(row.id, "type", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.label}
                    onChange={(e) => update(row.id, "label", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.value}
                    onChange={(e) => update(row.id, "value", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <select
                    className="flex h-9 w-full min-w-28 rounded-md border border-input bg-background px-2 text-sm"
                    value={row.iconKey}
                    onChange={(e) =>
                      update(row.id, "iconKey", e.target.value)
                    }
                  >
                    {ALLOWED_CONTACT_ICON_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={row.published}
                    onCheckedChange={(v) => update(row.id, "published", v)}
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
            <TableRow>
              <TableCell />
              <TableCell>
                <Input
                  placeholder="email | phone | chat | office"
                  value={newRow.type}
                  onChange={(e) =>
                    setNewRow((r) => ({ ...r, type: e.target.value }))
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Label"
                  value={newRow.label}
                  onChange={(e) =>
                    setNewRow((r) => ({ ...r, label: e.target.value }))
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Value"
                  value={newRow.value}
                  onChange={(e) =>
                    setNewRow((r) => ({ ...r, value: e.target.value }))
                  }
                />
              </TableCell>
              <TableCell>
                <select
                  className="flex h-9 w-full min-w-28 rounded-md border border-input bg-background px-2 text-sm"
                  value={newRow.iconKey}
                  onChange={(e) =>
                    setNewRow((r) => ({ ...r, iconKey: e.target.value }))
                  }
                >
                  {ALLOWED_CONTACT_ICON_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <Switch
                  checked={newRow.published}
                  onCheckedChange={(v) =>
                    setNewRow((r) => ({ ...r, published: v }))
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

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete channel?"
        description="This removes the channel from the public contact page."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
