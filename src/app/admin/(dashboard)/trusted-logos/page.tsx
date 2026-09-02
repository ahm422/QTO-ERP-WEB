"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch, adminUpload } from "@/lib/admin-fetch";
import { useAuth } from "@/lib/auth-context";
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

type TrustedLogoRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  logoImageKey: string | null;
  linkUrl: string | null;
  published: boolean;
  sortOrder: number;
};

type DraftRow = {
  name: string;
  linkUrl: string;
  logoImageKey: string | null;
  imageUrl: string | null;
  published: boolean;
};

const emptyDraft = (): DraftRow => ({
  name: "",
  linkUrl: "",
  logoImageKey: null,
  imageUrl: null,
  published: true,
});

function sortRows(rows: TrustedLogoRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function TrustedLogosAdminPage() {
  const { can } = useAuth();
  const canDelete = can("content:delete");
  const [rows, setRows] = useState<TrustedLogoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<DraftRow>(emptyDraft());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; items: TrustedLogoRow[] }>(
        "/api/admin/trusted-logos",
      );
      setRows(sortRows(data.items));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load trusted logos",
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
    field: keyof TrustedLogoRow,
    value: string | number | boolean | null,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const saveRow = async (row: TrustedLogoRow) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; item: TrustedLogoRow }>(
        `/api/admin/trusted-logos/${row.id}`,
        {
          method: "PATCH",
          json: {
            name: row.name,
            linkUrl: row.linkUrl || null,
            logoImageKey: row.logoImageKey,
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

  const persistOrder = async (ordered: TrustedLogoRow[]) => {
    const next = ordered.map((r, i) => ({ ...r, sortOrder: i }));
    setRows(next);
    try {
      await Promise.all(
        next.map((r) =>
          adminFetch(`/api/admin/trusted-logos/${r.id}`, {
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

  const uploadLogo = async (
    file: File,
    target: "new" | string,
  ): Promise<{ objectKey: string; imageUrl: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    setUploadingId(target);
    try {
      const data = await adminUpload<{
        ok?: boolean;
        objectKey?: string;
        imageUrl?: string;
      }>("/api/admin/trusted-logos/upload", formData);
      if (!data.objectKey || !data.imageUrl) {
        throw new Error("Upload failed");
      }
      return { objectKey: data.objectKey, imageUrl: data.imageUrl };
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setUploadingId(null);
    }
  };

  const createRow = async () => {
    if (!newRow.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const data = await adminFetch<{ ok: true; item: TrustedLogoRow }>(
        "/api/admin/trusted-logos",
        {
          method: "POST",
          json: {
            name: newRow.name,
            linkUrl: newRow.linkUrl || null,
            logoImageKey: newRow.logoImageKey,
            published: newRow.published,
          },
        },
      );
      setRows((prev) => sortRows([...prev, data.item]));
      setNewRow(emptyDraft());
      toast.success("Logo created");
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
      await adminFetch(`/api/admin/trusted-logos/${deleteId}`, {
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
        <h1 className="text-2xl font-semibold">Trusted logos</h1>
        <p className="text-sm text-muted-foreground">
          Manage the home Trusted By strip. Upload optional logos to R2 or keep
          text-only names.
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
                <TableHead>Name</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Logo</TableHead>
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
                  <TableCell data-label="Name">
                    <Input
                      value={row.name}
                      onChange={(e) => update(row.id, "name", e.target.value)}
                    />
                  </TableCell>
                  <TableCell data-label="Link">
                    <Input
                      value={row.linkUrl ?? ""}
                      onChange={(e) =>
                        update(row.id, "linkUrl", e.target.value || null)
                      }
                      className="min-w-40"
                      placeholder="/ or https://…"
                    />
                  </TableCell>
                  <TableCell data-label="Logo">
                    <div className="flex min-w-48 flex-col gap-2">
                      {row.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.imageUrl}
                          alt={row.name}
                          className="h-8 w-auto max-w-32 object-contain"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Text only
                        </span>
                      )}
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/svg+xml,image/avif,image/png,image/webp,image/jpeg"
                          disabled={uploadingId === row.id}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            const uploaded = await uploadLogo(file, row.id);
                            if (!uploaded) return;
                            update(row.id, "logoImageKey", uploaded.objectKey);
                            update(row.id, "imageUrl", uploaded.imageUrl);
                          }}
                        />
                        {row.logoImageKey ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              update(row.id, "logoImageKey", null);
                              update(row.id, "imageUrl", null);
                            }}
                          >
                            Clear
                          </Button>
                        ) : null}
                      </div>
                    </div>
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
                <TableCell data-label="Name">
                  <Input
                    placeholder="New name"
                    value={newRow.name}
                    onChange={(e) =>
                      setNewRow((r) => ({ ...r, name: e.target.value }))
                    }
                  />
                </TableCell>
                <TableCell data-label="Link">
                  <Input
                    placeholder="Optional link"
                    value={newRow.linkUrl}
                    onChange={(e) =>
                      setNewRow((r) => ({ ...r, linkUrl: e.target.value }))
                    }
                  />
                </TableCell>
                <TableCell data-label="Logo">
                  <div className="flex flex-col gap-2">
                    {newRow.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={newRow.imageUrl}
                        alt=""
                        className="h-8 w-auto max-w-32 object-contain"
                      />
                    ) : null}
                    <Input
                      type="file"
                      accept="image/svg+xml,image/avif,image/png,image/webp,image/jpeg"
                      disabled={uploadingId === "new"}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        const uploaded = await uploadLogo(file, "new");
                        if (!uploaded) return;
                        setNewRow((r) => ({
                          ...r,
                          logoImageKey: uploaded.objectKey,
                          imageUrl: uploaded.imageUrl,
                        }));
                      }}
                    />
                  </div>
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
          title="Delete trusted logo?"
          description="This removes the logo from the Trusted By strip."
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
