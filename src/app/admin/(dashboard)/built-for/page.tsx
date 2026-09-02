"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { useAuth } from "@/lib/auth-context";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ALLOWED_BUILT_FOR_ICON_KEYS } from "@/lib/icon-map";
import { BUILT_FOR_SECTION_DEFAULT } from "@/lib/home-sections-defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type SectionForm = {
  tag: string;
  title: string;
  accent: string;
  description: string;
};

type BuiltForCardRow = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  published: boolean;
  sortOrder: number;
};

type DraftCard = {
  title: string;
  description: string;
  iconKey: string;
  published: boolean;
};

const emptyCard = (): DraftCard => ({
  title: "",
  description: "",
  iconKey: "hard-hat",
  published: true,
});

function sortRows(rows: BuiltForCardRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function BuiltForAdminPage() {
  const { can } = useAuth();
  const canDelete = can("content:delete");
  const [section, setSection] = useState<SectionForm>({
    tag: BUILT_FOR_SECTION_DEFAULT.tag,
    title: BUILT_FOR_SECTION_DEFAULT.title,
    accent: BUILT_FOR_SECTION_DEFAULT.accent,
    description: BUILT_FOR_SECTION_DEFAULT.description,
  });
  const [rows, setRows] = useState<BuiltForCardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState<DraftCard>(emptyCard());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionData, cardsData] = await Promise.all([
        adminFetch<{
          ok: true;
          section: SectionForm & { sectionKey: string };
        }>("/api/admin/home-sections/built_for"),
        adminFetch<{ ok: true; items: BuiltForCardRow[] }>(
          "/api/admin/built-for-cards",
        ),
      ]);
      setSection({
        tag: sectionData.section.tag,
        title: sectionData.section.title,
        accent: sectionData.section.accent,
        description: sectionData.section.description,
      });
      setRows(sortRows(cardsData.items));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load Built For",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSection = async () => {
    setSavingSection(true);
    try {
      const data = await adminFetch<{
        ok: true;
        section: SectionForm & { sectionKey: string };
      }>("/api/admin/home-sections/built_for", {
        method: "PATCH",
        json: section,
      });
      setSection({
        tag: data.section.tag,
        title: data.section.title,
        accent: data.section.accent,
        description: data.section.description,
      });
      toast.success("Section header saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save section",
      );
    } finally {
      setSavingSection(false);
    }
  };

  const update = (
    id: string,
    field: keyof BuiltForCardRow,
    value: string | number | boolean,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const saveRow = async (row: BuiltForCardRow) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; item: BuiltForCardRow }>(
        `/api/admin/built-for-cards/${row.id}`,
        {
          method: "PATCH",
          json: {
            title: row.title,
            description: row.description,
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

  const persistOrder = async (ordered: BuiltForCardRow[]) => {
    const next = ordered.map((r, i) => ({ ...r, sortOrder: i }));
    setRows(next);
    try {
      await Promise.all(
        next.map((r) =>
          adminFetch(`/api/admin/built-for-cards/${r.id}`, {
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
    if (!newCard.title.trim() || !newCard.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    try {
      const data = await adminFetch<{ ok: true; item: BuiltForCardRow }>(
        "/api/admin/built-for-cards",
        { method: "POST", json: newCard },
      );
      setRows((prev) => sortRows([...prev, data.item]));
      setNewCard(emptyCard());
      toast.success("Card created");
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
      await adminFetch(`/api/admin/built-for-cards/${deleteId}`, {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Built for</h1>
        <p className="text-sm text-muted-foreground">
          Edit the Built For section header and audience cards on the home page.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <section className="space-y-4 rounded-md border p-4">
            <h2 className="text-lg font-medium">Section header</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="bf-tag">Tag</Label>
                <Input
                  id="bf-tag"
                  className="mt-1"
                  value={section.tag}
                  onChange={(e) =>
                    setSection((s) => ({ ...s, tag: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="bf-accent">Accent</Label>
                <Input
                  id="bf-accent"
                  className="mt-1"
                  value={section.accent}
                  onChange={(e) =>
                    setSection((s) => ({ ...s, accent: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="bf-title">Title</Label>
                <Input
                  id="bf-title"
                  className="mt-1"
                  value={section.title}
                  onChange={(e) =>
                    setSection((s) => ({ ...s, title: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="bf-description">Description</Label>
                <Textarea
                  id="bf-description"
                  className="mt-1"
                  rows={3}
                  value={section.description}
                  onChange={(e) =>
                    setSection((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={saveSection}
              disabled={savingSection}
            >
              Save header
            </Button>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium">Audience cards</h2>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
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
                      <TableCell data-label="Title">
                        <Input
                          value={row.title}
                          onChange={(e) =>
                            update(row.id, "title", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell
                        data-label="Description"
                        className="max-md:flex-col max-md:items-stretch"
                      >
                        <Textarea
                          className="min-w-56 max-md:min-w-0"
                          rows={2}
                          value={row.description}
                          onChange={(e) =>
                            update(row.id, "description", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell data-label="Icon">
                        <select
                          value={row.iconKey}
                          onChange={(e) =>
                            update(row.id, "iconKey", e.target.value)
                          }
                          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          {ALLOWED_BUILT_FOR_ICON_KEYS.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell data-label="Published">
                        <Switch
                          checked={row.published}
                          onCheckedChange={(v) =>
                            update(row.id, "published", v)
                          }
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
                    <TableCell data-label="Title">
                      <Input
                        placeholder="Title"
                        value={newCard.title}
                        onChange={(e) =>
                          setNewCard((c) => ({ ...c, title: e.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell
                      data-label="Description"
                      className="max-md:flex-col max-md:items-stretch"
                    >
                      <Textarea
                        className="min-w-56 max-md:min-w-0"
                        rows={2}
                        placeholder="Description"
                        value={newCard.description}
                        onChange={(e) =>
                          setNewCard((c) => ({
                            ...c,
                            description: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell data-label="Icon">
                      <select
                        value={newCard.iconKey}
                        onChange={(e) =>
                          setNewCard((c) => ({
                            ...c,
                            iconKey: e.target.value,
                          }))
                        }
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        {ALLOWED_BUILT_FOR_ICON_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell data-label="Published">
                      <Switch
                        checked={newCard.published}
                        onCheckedChange={(v) =>
                          setNewCard((c) => ({ ...c, published: v }))
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
          </section>
        </>
      )}

      {canDelete ? (
        <ConfirmDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null);
          }}
          title="Delete Built For card?"
          description="This removes the audience card from the home section."
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
