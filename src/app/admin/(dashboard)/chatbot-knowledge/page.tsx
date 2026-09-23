"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { useAuth } from "@/lib/auth-context";
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

type KnowledgeRow = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  enabled: boolean;
  sortOrder: number;
};

type DraftArticle = {
  title: string;
  body: string;
  category: string;
  enabled: boolean;
};

const emptyArticle = (): DraftArticle => ({
  title: "",
  body: "",
  category: "",
  enabled: true,
});

function sortRows(rows: KnowledgeRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function ChatbotKnowledgeAdminPage() {
  const { can } = useAuth();
  const canDelete = can("content:delete");

  const [rows, setRows] = useState<KnowledgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newArticle, setNewArticle] = useState<DraftArticle>(emptyArticle());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; items: KnowledgeRow[] }>(
        "/api/admin/chatbot-knowledge",
      );
      setRows(sortRows(data.items));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load chatbot knowledge",
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
    field: keyof KnowledgeRow,
    value: string | number | boolean | null,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const saveRow = async (row: KnowledgeRow) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; item: KnowledgeRow }>(
        `/api/admin/chatbot-knowledge/${row.id}`,
        {
          method: "PATCH",
          json: {
            title: row.title,
            body: row.body,
            category: row.category || null,
            enabled: row.enabled,
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

  const persistOrder = async (ordered: KnowledgeRow[]) => {
    const next = ordered.map((r, i) => ({ ...r, sortOrder: i }));
    setRows(next);
    try {
      await Promise.all(
        next.map((r) =>
          adminFetch(`/api/admin/chatbot-knowledge/${r.id}`, {
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
    if (!newArticle.title.trim() || !newArticle.body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    try {
      const data = await adminFetch<{ ok: true; item: KnowledgeRow }>(
        "/api/admin/chatbot-knowledge",
        {
          method: "POST",
          json: {
            title: newArticle.title,
            body: newArticle.body,
            category: newArticle.category.trim() || null,
            enabled: newArticle.enabled,
          },
        },
      );
      setRows((prev) => sortRows([...prev, data.item]));
      setNewArticle(emptyArticle());
      toast.success("Knowledge article created");
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
      await adminFetch(`/api/admin/chatbot-knowledge/${deleteId}`, {
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
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Bot className="size-6" aria-hidden />
          Chatbot knowledge
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Articles here power the site chatbot only. They never appear on the
          public FAQ sections. Disable an article to pause it from the bot
          without deleting it. Site FAQs still use the Published switch on the
          FAQs screen.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Articles</h2>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Body</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Enabled</TableHead>
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
                      data-label="Body"
                      className="max-md:flex-col max-md:items-stretch"
                    >
                      <Textarea
                        className="min-w-56 max-md:min-w-0"
                        rows={5}
                        value={row.body}
                        onChange={(e) =>
                          update(row.id, "body", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell data-label="Category">
                      <Input
                        value={row.category ?? ""}
                        onChange={(e) =>
                          update(row.id, "category", e.target.value || null)
                        }
                      />
                    </TableCell>
                    <TableCell data-label="Enabled">
                      <Switch
                        checked={row.enabled}
                        onCheckedChange={(v) => update(row.id, "enabled", v)}
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
                      value={newArticle.title}
                      onChange={(e) =>
                        setNewArticle((f) => ({
                          ...f,
                          title: e.target.value,
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell
                    data-label="Body"
                    className="max-md:flex-col max-md:items-stretch"
                  >
                    <Textarea
                      className="min-w-56 max-md:min-w-0"
                      rows={5}
                      placeholder="Body — what the chatbot should know"
                      value={newArticle.body}
                      onChange={(e) =>
                        setNewArticle((f) => ({ ...f, body: e.target.value }))
                      }
                    />
                  </TableCell>
                  <TableCell data-label="Category">
                    <Input
                      placeholder="Category"
                      value={newArticle.category}
                      onChange={(e) =>
                        setNewArticle((f) => ({
                          ...f,
                          category: e.target.value,
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell data-label="Enabled">
                    <Switch
                      checked={newArticle.enabled}
                      onCheckedChange={(v) =>
                        setNewArticle((f) => ({ ...f, enabled: v }))
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
      )}

      {canDelete ? (
        <ConfirmDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null);
          }}
          title="Delete knowledge article?"
          description="This removes the article from the chatbot. It was never shown on the public site."
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
