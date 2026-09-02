"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { useAuth } from "@/lib/auth-context";
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

const ALLOWED_ICON_KEYS = ["newspaper", "info", "mail", "code", "link", "external-link"] as const;

type NavResource = {
  id:        string;
  label:     string;
  href:      string;
  iconKey:   string;
  subtitle:  string | null;
  visible:   boolean;
  external:  boolean;
  sortOrder: number;
};

type DraftRow = Omit<NavResource, "id">;

const emptyRow = (): DraftRow => ({
  label:     "",
  href:      "",
  iconKey:   "newspaper",
  subtitle:  "",
  visible:   true,
  external:  false,
  sortOrder: 0,
});

export default function NavResourcesAdminPage() {
  const { can } = useAuth();
  const canDelete = can("settings:edit");
  const [rows, setRows]         = useState<NavResource[]>([]);
  const [loading, setLoading]   = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newRow, setNewRow]     = useState<DraftRow>(emptyRow());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; items: NavResource[] }>("/api/admin/nav-resources");
      setRows(data.items);
    } catch (err) {
      toast.error(err instanceof AdminFetchError ? err.message : "Failed to load nav resources");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveRow = async (row: NavResource) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; item: NavResource }>(
        `/api/admin/nav-resources/${row.id}`,
        {
          method: "PATCH",
          json: {
            label:     row.label,
            href:      row.href,
            iconKey:   row.iconKey,
            subtitle:  row.subtitle || null,
            visible:   row.visible,
            external:  row.external,
            sortOrder: row.sortOrder,
          },
        },
      );
      setRows((prev) => prev.map((r) => r.id === row.id ? data.item : r));
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof AdminFetchError ? err.message : "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  const createRow = async () => {
    try {
      const data = await adminFetch<{ ok: true; item: NavResource }>(
        "/api/admin/nav-resources",
        { method: "POST", json: { ...newRow, subtitle: newRow.subtitle || null } },
      );
      setRows((prev) => [...prev, data.item]);
      setNewRow(emptyRow());
      toast.success("Row created");
    } catch (err) {
      toast.error(err instanceof AdminFetchError ? err.message : "Failed to create row");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/nav-resources/${deleteId}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success("Deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof AdminFetchError ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const update = (id: string, field: keyof NavResource, value: string | number | boolean | null) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nav resources</h1>
        <p className="text-sm text-muted-foreground">
          Manage the Resources dropdown links in the site navbar.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Href</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>External</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Order</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell data-label="Label">
                    <Input value={row.label} onChange={(e) => update(row.id, "label", e.target.value)} />
                  </TableCell>
                  <TableCell data-label="Href">
                    <Input value={row.href} onChange={(e) => update(row.id, "href", e.target.value)} className="min-w-40" />
                  </TableCell>
                  <TableCell data-label="Icon">
                    <select
                      value={row.iconKey}
                      onChange={(e) => update(row.id, "iconKey", e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      {ALLOWED_ICON_KEYS.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell data-label="Subtitle">
                    <Input
                      value={row.subtitle ?? ""}
                      onChange={(e) => update(row.id, "subtitle", e.target.value || null)}
                      className="min-w-36"
                    />
                  </TableCell>
                  <TableCell data-label="External">
                    <Switch checked={row.external} onCheckedChange={(v) => update(row.id, "external", v)} />
                  </TableCell>
                  <TableCell data-label="Visible">
                    <Switch checked={row.visible} onCheckedChange={(v) => update(row.id, "visible", v)} />
                  </TableCell>
                  <TableCell data-label="Order">
                    <Input
                      type="number"
                      className="w-20"
                      value={row.sortOrder}
                      onChange={(e) => update(row.id, "sortOrder", Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="max-md:justify-end">
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => saveRow(row)} disabled={savingId === row.id}>
                        Save
                      </Button>
                      {canDelete ? (
                        <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteId(row.id)}>
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add row form */}
      <div className="rounded-md border p-4 space-y-4">
        <h2 className="font-medium">Add row</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Label</Label>
            <Input className="mt-1" value={newRow.label} onChange={(e) => setNewRow((r) => ({ ...r, label: e.target.value }))} />
          </div>
          <div>
            <Label>Href</Label>
            <Input className="mt-1" value={newRow.href} onChange={(e) => setNewRow((r) => ({ ...r, href: e.target.value }))} />
          </div>
          <div>
            <Label>Icon</Label>
            <select
              value={newRow.iconKey}
              onChange={(e) => setNewRow((r) => ({ ...r, iconKey: e.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {ALLOWED_ICON_KEYS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input className="mt-1" value={newRow.subtitle ?? ""} onChange={(e) => setNewRow((r) => ({ ...r, subtitle: e.target.value }))} />
          </div>
          <div>
            <Label>Sort order</Label>
            <Input type="number" className="mt-1 w-24" value={newRow.sortOrder} onChange={(e) => setNewRow((r) => ({ ...r, sortOrder: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={newRow.external} onCheckedChange={(v) => setNewRow((r) => ({ ...r, external: v }))} />
            <Label>External link</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={newRow.visible} onCheckedChange={(v) => setNewRow((r) => ({ ...r, visible: v }))} />
            <Label>Visible</Label>
          </div>
          <Button type="button" onClick={createRow}>Add row</Button>
        </div>
      </div>

      {canDelete ? (
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          title="Delete nav resource"
          description="This link will be removed from the navbar Resources dropdown."
          loading={deleting}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
