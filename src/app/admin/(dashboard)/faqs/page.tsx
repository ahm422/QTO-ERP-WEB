"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { useAuth } from "@/lib/auth-context";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  FAQ_PAGE_KEY_CONTACT,
  FAQ_PAGE_KEY_HOME,
  FAQ_PAGE_KEY_PRICING,
  FAQ_SECTION_DEFAULT,
} from "@/lib/faqs-defaults";
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
import Link from "next/link";
import { cn } from "@/lib/utils";

const FAQ_PAGE_KEYS = [
  { key: FAQ_PAGE_KEY_HOME, label: "Home" },
  { key: FAQ_PAGE_KEY_PRICING, label: "Pricing" },
  { key: FAQ_PAGE_KEY_CONTACT, label: "Contact" },
] as const;

type SectionForm = {
  tag: string;
  title: string;
  accent: string;
  description: string;
};

type FaqRow = {
  id: string;
  pageKey: string;
  question: string;
  answer: string;
  category: string | null;
  published: boolean;
  sortOrder: number;
};

type DraftFaq = {
  question: string;
  answer: string;
  category: string;
  published: boolean;
};

const emptyFaq = (): DraftFaq => ({
  question: "",
  answer: "",
  category: "",
  published: true,
});

function sortRows(rows: FaqRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

function FaqsAdminInner() {
  const { can } = useAuth();
  const canDelete = can("content:delete");
  const searchParams = useSearchParams();
  const pageKey = searchParams.get("pageKey")?.trim() || FAQ_PAGE_KEY_HOME;
  const isHome = pageKey === FAQ_PAGE_KEY_HOME;

  const [section, setSection] = useState<SectionForm>({
    tag: FAQ_SECTION_DEFAULT.tag,
    title: FAQ_SECTION_DEFAULT.title,
    accent: FAQ_SECTION_DEFAULT.accent,
    description: FAQ_SECTION_DEFAULT.description,
  });
  const [rows, setRows] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newFaq, setNewFaq] = useState<DraftFaq>(emptyFaq());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const faqsPromise = adminFetch<{
        ok: true;
        pageKey: string;
        items: FaqRow[];
      }>(`/api/admin/faqs?pageKey=${encodeURIComponent(pageKey)}`);

      if (isHome) {
        const [sectionData, faqsData] = await Promise.all([
          adminFetch<{
            ok: true;
            section: SectionForm & { sectionKey: string };
          }>("/api/admin/home-sections/faq"),
          faqsPromise,
        ]);
        setSection({
          tag: sectionData.section.tag,
          title: sectionData.section.title,
          accent: sectionData.section.accent,
          description: sectionData.section.description,
        });
        setRows(sortRows(faqsData.items));
      } else {
        const faqsData = await faqsPromise;
        setRows(sortRows(faqsData.items));
      }
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load FAQs",
      );
    } finally {
      setLoading(false);
    }
  }, [isHome, pageKey]);

  useEffect(() => {
    load();
  }, [load]);

  const saveSection = async () => {
    setSavingSection(true);
    try {
      const data = await adminFetch<{
        ok: true;
        section: SectionForm & { sectionKey: string };
      }>("/api/admin/home-sections/faq", {
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
    field: keyof FaqRow,
    value: string | number | boolean | null,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const saveRow = async (row: FaqRow) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; item: FaqRow }>(
        `/api/admin/faqs/${row.id}`,
        {
          method: "PATCH",
          json: {
            question: row.question,
            answer: row.answer,
            category: row.category || null,
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

  const persistOrder = async (ordered: FaqRow[]) => {
    const next = ordered.map((r, i) => ({ ...r, sortOrder: i }));
    setRows(next);
    try {
      await Promise.all(
        next.map((r) =>
          adminFetch(`/api/admin/faqs/${r.id}`, {
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
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    try {
      const data = await adminFetch<{ ok: true; item: FaqRow }>(
        "/api/admin/faqs",
        {
          method: "POST",
          json: {
            pageKey,
            question: newFaq.question,
            answer: newFaq.answer,
            category: newFaq.category.trim() || null,
            published: newFaq.published,
          },
        },
      );
      setRows((prev) => sortRows([...prev, data.item]));
      setNewFaq(emptyFaq());
      toast.success("FAQ created");
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
      await adminFetch(`/api/admin/faqs/${deleteId}`, { method: "DELETE" });
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
        <h1 className="text-2xl font-semibold">FAQs</h1>
        <p className="text-sm text-muted-foreground">
          Shared page FAQs (pageKey: {pageKey}). Unpublished items stay hidden
          on the public site.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FAQ_PAGE_KEYS.map(({ key, label }) => (
            <Link
              key={key}
              href={`/admin/faqs?pageKey=${key}`}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm",
                pageKey === key
                  ? "border-foreground bg-muted font-medium"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          {isHome ? (
            <section className="space-y-4 rounded-md border p-4">
              <h2 className="text-lg font-medium">Home FAQ section header</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="faq-tag">Tag</Label>
                  <Input
                    id="faq-tag"
                    className="mt-1"
                    value={section.tag}
                    onChange={(e) =>
                      setSection((s) => ({ ...s, tag: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="faq-accent">Accent</Label>
                  <Input
                    id="faq-accent"
                    className="mt-1"
                    value={section.accent}
                    onChange={(e) =>
                      setSection((s) => ({ ...s, accent: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="faq-title">Title</Label>
                  <Input
                    id="faq-title"
                    className="mt-1"
                    value={section.title}
                    onChange={(e) =>
                      setSection((s) => ({ ...s, title: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="faq-description">Description</Label>
                  <Textarea
                    id="faq-description"
                    className="mt-1"
                    rows={2}
                    value={section.description}
                    onChange={(e) =>
                      setSection((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
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
          ) : null}

          <section className="space-y-4">
            <h2 className="text-lg font-medium">Questions</h2>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Order</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Category</TableHead>
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
                          value={row.question}
                          onChange={(e) =>
                            update(row.id, "question", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          className="min-w-56"
                          rows={3}
                          value={row.answer}
                          onChange={(e) =>
                            update(row.id, "answer", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.category ?? ""}
                          onChange={(e) =>
                            update(row.id, "category", e.target.value || null)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={row.published}
                          onCheckedChange={(v) =>
                            update(row.id, "published", v)
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
                    <TableCell />
                    <TableCell>
                      <Input
                        placeholder="Question"
                        value={newFaq.question}
                        onChange={(e) =>
                          setNewFaq((f) => ({
                            ...f,
                            question: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        className="min-w-56"
                        rows={3}
                        placeholder="Answer"
                        value={newFaq.answer}
                        onChange={(e) =>
                          setNewFaq((f) => ({ ...f, answer: e.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Category"
                        value={newFaq.category}
                        onChange={(e) =>
                          setNewFaq((f) => ({
                            ...f,
                            category: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={newFaq.published}
                        onCheckedChange={(v) =>
                          setNewFaq((f) => ({ ...f, published: v }))
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
          </section>
        </>
      )}

      {canDelete ? (
        <ConfirmDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null);
          }}
          title="Delete FAQ?"
          description="This removes the question from the public FAQ list."
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}

export default function FaqsAdminPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
    >
      <FaqsAdminInner />
    </Suspense>
  );
}
