"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ALLOWED_DOMAIN_ICON_KEYS } from "@/lib/icon-map";
import { ECOSYSTEM_SECTION_DEFAULT } from "@/lib/home-sections-defaults";
import { orderIndexFromSortOrder } from "@/lib/industry-domains-defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type SectionForm = {
  tag: string;
  title: string;
  accent: string;
  description: string;
};

type DomainRow = {
  id: string;
  slug: string;
  name: string;
  orderIndex: string;
  systemsCount: number;
  iconKey: string;
  description: string;
  leaders: string[];
  ctaLabel: string | null;
  ctaUrl: string | null;
  published: boolean;
  sortOrder: number;
};

type DraftDomain = {
  slug: string;
  name: string;
  systemsCount: number;
  iconKey: string;
  description: string;
  leaders: string[];
  ctaLabel: string;
  ctaUrl: string;
  published: boolean;
};

const emptyDomain = (): DraftDomain => ({
  slug: "",
  name: "",
  systemsCount: 0,
  iconKey: "factory",
  description: "",
  leaders: [],
  ctaLabel: "",
  ctaUrl: "",
  published: true,
});

function sortRows(rows: DomainRow[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

function LeadersEditor({
  leaders,
  onChange,
}: {
  leaders: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {leaders.map((leader, i) => (
          <li key={`${i}-${leader}`} className="flex gap-2">
            <Input
              value={leader}
              onChange={(e) => {
                const next = [...leaders];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => onChange(leaders.filter((_, j) => j !== i))}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Add leader"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (!draft.trim() || leaders.length >= 20) return;
            onChange([...leaders, draft.trim()]);
            setDraft("");
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => {
            if (!draft.trim() || leaders.length >= 20) return;
            onChange([...leaders, draft.trim()]);
            setDraft("");
          }}
        >
          Add leader
        </Button>
      </div>
    </div>
  );
}

function DomainFields({
  name,
  slug,
  systemsCount,
  iconKey,
  description,
  leaders,
  ctaLabel,
  ctaUrl,
  published,
  onName,
  onSlug,
  onSystemsCount,
  onIconKey,
  onDescription,
  onLeaders,
  onCtaLabel,
  onCtaUrl,
  onPublished,
  showSlug = true,
}: {
  name: string;
  slug: string;
  systemsCount: number;
  iconKey: string;
  description: string;
  leaders: string[];
  ctaLabel: string;
  ctaUrl: string;
  published: boolean;
  onName: (v: string) => void;
  onSlug: (v: string) => void;
  onSystemsCount: (v: number) => void;
  onIconKey: (v: string) => void;
  onDescription: (v: string) => void;
  onLeaders: (v: string[]) => void;
  onCtaLabel: (v: string) => void;
  onCtaUrl: (v: string) => void;
  onPublished: (v: boolean) => void;
  showSlug?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>Name</Label>
        <Input
          className="mt-1"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Manufacturing"
        />
      </div>
      {showSlug ? (
        <div>
          <Label>Slug</Label>
          <Input
            className="mt-1 font-mono text-sm"
            value={slug}
            onChange={(e) => onSlug(e.target.value)}
            placeholder="manufacturing"
          />
        </div>
      ) : null}
      <div>
        <Label>Systems count</Label>
        <Input
          className="mt-1"
          type="number"
          min={0}
          value={systemsCount}
          onChange={(e) => onSystemsCount(Number(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label>Icon</Label>
        <select
          value={iconKey}
          onChange={(e) => onIconKey(e.target.value)}
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {ALLOWED_DOMAIN_ICON_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Label>Description</Label>
        <Textarea
          className="mt-1"
          rows={3}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder="Domain description"
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Leaders</Label>
        <div className="mt-1">
          <LeadersEditor leaders={leaders} onChange={onLeaders} />
        </div>
      </div>
      <div>
        <Label>CTA label</Label>
        <Input
          className="mt-1"
          value={ctaLabel}
          onChange={(e) => onCtaLabel(e.target.value)}
          placeholder="Explore Manufacturing Solutions"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Leave blank to use “Explore {"{name}"} Solutions”.
        </p>
      </div>
      <div>
        <Label>CTA URL</Label>
        <Input
          className="mt-1"
          value={ctaUrl}
          onChange={(e) => onCtaUrl(e.target.value)}
          placeholder="/allApps"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Leave blank to use /allApps.
        </p>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Switch checked={published} onCheckedChange={onPublished} />
        <Label>Published</Label>
      </div>
    </div>
  );
}

export default function IndustryDomainsAdminPage() {
  const [section, setSection] = useState<SectionForm>({
    tag: ECOSYSTEM_SECTION_DEFAULT.tag,
    title: ECOSYSTEM_SECTION_DEFAULT.title,
    accent: ECOSYSTEM_SECTION_DEFAULT.accent,
    description: ECOSYSTEM_SECTION_DEFAULT.description,
  });
  const [rows, setRows] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState<DraftDomain>(emptyDomain());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionData, domainsData] = await Promise.all([
        adminFetch<{
          ok: true;
          section: SectionForm & { sectionKey: string };
        }>("/api/admin/home-sections/ecosystem"),
        adminFetch<{ ok: true; items: DomainRow[] }>(
          "/api/admin/industry-domains",
        ),
      ]);
      setSection({
        tag: sectionData.section.tag,
        title: sectionData.section.title,
        accent: sectionData.section.accent,
        description: sectionData.section.description,
      });
      setRows(sortRows(domainsData.items));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load industry domains",
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
      }>("/api/admin/home-sections/ecosystem", {
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

  const update = <K extends keyof DomainRow>(
    id: string,
    field: K,
    value: DomainRow[K],
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const saveRow = async (row: DomainRow) => {
    setSavingId(row.id);
    try {
      const data = await adminFetch<{ ok: true; item: DomainRow }>(
        `/api/admin/industry-domains/${row.id}`,
        {
          method: "PATCH",
          json: {
            slug: row.slug,
            name: row.name,
            orderIndex: row.orderIndex,
            systemsCount: row.systemsCount,
            iconKey: row.iconKey,
            description: row.description,
            leaders: row.leaders.filter((l) => l.trim()),
            ctaLabel: row.ctaLabel?.trim() ? row.ctaLabel.trim() : null,
            ctaUrl: row.ctaUrl?.trim() ? row.ctaUrl.trim() : null,
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

  const persistOrder = async (ordered: DomainRow[]) => {
    const next = ordered.map((r, i) => ({
      ...r,
      sortOrder: i,
      orderIndex: orderIndexFromSortOrder(i),
    }));
    setRows(next);
    try {
      await Promise.all(
        next.map((r) =>
          adminFetch(`/api/admin/industry-domains/${r.id}`, {
            method: "PATCH",
            json: { sortOrder: r.sortOrder, orderIndex: r.orderIndex },
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
    if (!newDomain.slug.trim() || !newDomain.name.trim()) {
      toast.error("Slug and name are required");
      return;
    }
    if (!newDomain.description.trim()) {
      toast.error("Description is required");
      return;
    }
    setCreating(true);
    try {
      const data = await adminFetch<{ ok: true; item: DomainRow }>(
        "/api/admin/industry-domains",
        {
          method: "POST",
          json: {
            slug: newDomain.slug.trim(),
            name: newDomain.name.trim(),
            systemsCount: newDomain.systemsCount,
            iconKey: newDomain.iconKey,
            description: newDomain.description.trim(),
            leaders: newDomain.leaders.filter((l) => l.trim()),
            ctaLabel: newDomain.ctaLabel.trim() || null,
            ctaUrl: newDomain.ctaUrl.trim() || null,
            published: newDomain.published,
          },
        },
      );
      setRows((prev) => sortRows([...prev, data.item]));
      setNewDomain(emptyDomain());
      toast.success("Domain created");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to create",
      );
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/industry-domains/${deleteId}`, {
        method: "DELETE",
      });
      toast.success("Deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to delete",
      );
    } finally {
      setDeleting(false);
    }
  };

  const ordered = sortRows(rows);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Industry domains</h1>
        <p className="text-sm text-muted-foreground">
          Edit the Connected Ecosystem section header and industry domains on
          the home page.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <section className="space-y-4 rounded-md border p-4 sm:p-5">
            <h2 className="text-lg font-medium">Section header</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="eco-tag">Tag</Label>
                <Input
                  id="eco-tag"
                  className="mt-1"
                  value={section.tag}
                  onChange={(e) =>
                    setSection((s) => ({ ...s, tag: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="eco-accent">Accent</Label>
                <Input
                  id="eco-accent"
                  className="mt-1"
                  value={section.accent}
                  onChange={(e) =>
                    setSection((s) => ({ ...s, accent: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="eco-title">Title</Label>
                <Input
                  id="eco-title"
                  className="mt-1"
                  value={section.title}
                  onChange={(e) =>
                    setSection((s) => ({ ...s, title: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="eco-description">Description</Label>
                <Textarea
                  id="eco-description"
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
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-lg font-medium">Industry domains</h2>
              <p className="text-xs text-muted-foreground">
                {ordered.length} domain{ordered.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="space-y-4">
              {ordered.map((row, index) => (
                <article
                  key={row.id}
                  className="space-y-4 rounded-md border p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">
                        {row.orderIndex}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {row.name || "Untitled domain"}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {row.slug || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
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
                        disabled={index === ordered.length - 1}
                        onClick={() => moveRow(index, 1)}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
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
                  </div>

                  <DomainFields
                    name={row.name}
                    slug={row.slug}
                    systemsCount={row.systemsCount}
                    iconKey={row.iconKey}
                    description={row.description}
                    leaders={row.leaders}
                    ctaLabel={row.ctaLabel ?? ""}
                    ctaUrl={row.ctaUrl ?? ""}
                    published={row.published}
                    onName={(v) => update(row.id, "name", v)}
                    onSlug={(v) => update(row.id, "slug", v)}
                    onSystemsCount={(v) => update(row.id, "systemsCount", v)}
                    onIconKey={(v) => update(row.id, "iconKey", v)}
                    onDescription={(v) => update(row.id, "description", v)}
                    onLeaders={(v) => update(row.id, "leaders", v)}
                    onCtaLabel={(v) => update(row.id, "ctaLabel", v || null)}
                    onCtaUrl={(v) => update(row.id, "ctaUrl", v || null)}
                    onPublished={(v) => update(row.id, "published", v)}
                  />
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-md border border-dashed p-4 sm:p-5">
            <h2 className="text-lg font-medium">Add domain</h2>
            <DomainFields
              name={newDomain.name}
              slug={newDomain.slug}
              systemsCount={newDomain.systemsCount}
              iconKey={newDomain.iconKey}
              description={newDomain.description}
              leaders={newDomain.leaders}
              ctaLabel={newDomain.ctaLabel}
              ctaUrl={newDomain.ctaUrl}
              published={newDomain.published}
              onName={(v) => setNewDomain((d) => ({ ...d, name: v }))}
              onSlug={(v) => setNewDomain((d) => ({ ...d, slug: v }))}
              onSystemsCount={(v) =>
                setNewDomain((d) => ({ ...d, systemsCount: v }))
              }
              onIconKey={(v) => setNewDomain((d) => ({ ...d, iconKey: v }))}
              onDescription={(v) =>
                setNewDomain((d) => ({ ...d, description: v }))
              }
              onLeaders={(v) => setNewDomain((d) => ({ ...d, leaders: v }))}
              onCtaLabel={(v) => setNewDomain((d) => ({ ...d, ctaLabel: v }))}
              onCtaUrl={(v) => setNewDomain((d) => ({ ...d, ctaUrl: v }))}
              onPublished={(v) =>
                setNewDomain((d) => ({ ...d, published: v }))
              }
            />
            <Button type="button" onClick={createRow} disabled={creating}>
              Add domain
            </Button>
          </section>
        </>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete industry domain?"
        description="This removes the domain from the Connected Ecosystem section."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
