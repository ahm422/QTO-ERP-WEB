"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { AdminFormWidth } from "@/components/admin/AdminFormWidth";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FOOTER_CONTENT_DEFAULTS } from "@/lib/footer-defaults";
import type {
  FooterContent,
  FooterLinkDto,
  FooterLinkGroupDto,
} from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const emptyLink = (): FooterLinkDto => ({
  label: "",
  url: "",
  external: false,
});

const emptyGroup = (): FooterLinkGroupDto => ({
  title: "",
  links: [emptyLink()],
});

export default function FooterAdminPage() {
  const [footer, setFooter] = useState<FooterContent>({
    brandBlurb: FOOTER_CONTENT_DEFAULTS.brandBlurb,
    builtByLabel: FOOTER_CONTENT_DEFAULTS.builtByLabel,
    builtByUrl: FOOTER_CONTENT_DEFAULTS.builtByUrl,
    newsletterHeading: FOOTER_CONTENT_DEFAULTS.newsletterHeading,
    newsletterCopy: FOOTER_CONTENT_DEFAULTS.newsletterCopy,
    linkGroups: FOOTER_CONTENT_DEFAULTS.linkGroups,
    copyrightText: FOOTER_CONTENT_DEFAULTS.copyrightText,
    bottomLinks: FOOTER_CONTENT_DEFAULTS.bottomLinks,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; footer: FooterContent }>(
        "/api/admin/footer",
      );
      setFooter(data.footer);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load footer",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const data = await adminFetch<{ ok: true; footer: FooterContent }>(
        "/api/admin/footer",
        {
          method: "PUT",
          json: {
            brandBlurb: footer.brandBlurb,
            builtByLabel: footer.builtByLabel,
            builtByUrl: footer.builtByUrl,
            newsletterHeading: footer.newsletterHeading,
            newsletterCopy: footer.newsletterCopy,
            linkGroups: footer.linkGroups,
            copyrightText: footer.copyrightText,
            bottomLinks: footer.bottomLinks,
          },
        },
      );
      setFooter(data.footer);
      toast.success("Footer saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save footer",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateGroup = (index: number, patch: Partial<FooterLinkGroupDto>) => {
    setFooter((prev) => ({
      ...prev,
      linkGroups: prev.linkGroups.map((g, i) =>
        i === index ? { ...g, ...patch } : g,
      ),
    }));
  };

  const moveGroup = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= footer.linkGroups.length) return;
    const next = [...footer.linkGroups];
    const tmp = next[index];
    next[index] = next[j];
    next[j] = tmp;
    setFooter((prev) => ({ ...prev, linkGroups: next }));
  };

  const updateLink = (
    groupIndex: number,
    linkIndex: number,
    patch: Partial<FooterLinkDto>,
  ) => {
    setFooter((prev) => ({
      ...prev,
      linkGroups: prev.linkGroups.map((g, gi) => {
        if (gi !== groupIndex) return g;
        return {
          ...g,
          links: g.links.map((l, li) =>
            li === linkIndex ? { ...l, ...patch } : l,
          ),
        };
      }),
    }));
  };

  const moveLink = (groupIndex: number, linkIndex: number, dir: -1 | 1) => {
    setFooter((prev) => {
      const groups = [...prev.linkGroups];
      const group = groups[groupIndex];
      const j = linkIndex + dir;
      if (j < 0 || j >= group.links.length) return prev;
      const links = [...group.links];
      const tmp = links[linkIndex];
      links[linkIndex] = links[j];
      links[j] = tmp;
      groups[groupIndex] = { ...group, links };
      return { ...prev, linkGroups: groups };
    });
  };

  const updateBottomLink = (index: number, patch: Partial<FooterLinkDto>) => {
    setFooter((prev) => ({
      ...prev,
      bottomLinks: prev.bottomLinks.map((l, i) =>
        i === index ? { ...l, ...patch } : l,
      ),
    }));
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <AdminPage>
      <AdminFormWidth size="lg" className="space-y-8">
      <AdminPageHeader
        title="Footer"
        description="Global footer brand copy, link groups, newsletter text, and bottom links. Newsletter subscribe still posts to /api/subscribe."
      />

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Brand</h2>
        <div>
          <Label htmlFor="brand-blurb">Brand blurb</Label>
          <Textarea
            id="brand-blurb"
            className="mt-1"
            rows={3}
            value={footer.brandBlurb}
            onChange={(e) =>
              setFooter({ ...footer, brandBlurb: e.target.value })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="built-by-label">Built-by label</Label>
            <Input
              id="built-by-label"
              className="mt-1"
              value={footer.builtByLabel}
              onChange={(e) =>
                setFooter({ ...footer, builtByLabel: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="built-by-url">Built-by URL</Label>
            <Input
              id="built-by-url"
              className="mt-1"
              value={footer.builtByUrl}
              onChange={(e) =>
                setFooter({ ...footer, builtByUrl: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Newsletter</h2>
        <div>
          <Label htmlFor="newsletter-heading">Heading</Label>
          <Input
            id="newsletter-heading"
            className="mt-1"
            value={footer.newsletterHeading}
            onChange={(e) =>
              setFooter({ ...footer, newsletterHeading: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="newsletter-copy">Copy</Label>
          <Textarea
            id="newsletter-copy"
            className="mt-1"
            rows={2}
            value={footer.newsletterCopy}
            onChange={(e) =>
              setFooter({ ...footer, newsletterCopy: e.target.value })
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Link groups</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setFooter((prev) => ({
                ...prev,
                linkGroups: [...prev.linkGroups, emptyGroup()],
              }))
            }
          >
            <Plus className="mr-1 size-4" />
            Add group
          </Button>
        </div>

        {footer.linkGroups.map((group, gi) => (
          <div key={gi} className="space-y-3 rounded-md border p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-48 flex-1">
                <Label>Group title</Label>
                <Input
                  className="mt-1"
                  value={group.title}
                  onChange={(e) => updateGroup(gi, { title: e.target.value })}
                />
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Move group up"
                  disabled={gi === 0}
                  onClick={() => moveGroup(gi, -1)}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Move group down"
                  disabled={gi === footer.linkGroups.length - 1}
                  onClick={() => moveGroup(gi, 1)}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Remove group"
                  onClick={() =>
                    setFooter((prev) => ({
                      ...prev,
                      linkGroups: prev.linkGroups.filter((_, i) => i !== gi),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {group.links.map((link, li) => (
              <div
                key={li}
                className="grid gap-2 rounded-md bg-muted/40 p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
              >
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) =>
                    updateLink(gi, li, { label: e.target.value })
                  }
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink(gi, li, { url: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={Boolean(link.external)}
                    onCheckedChange={(v) =>
                      updateLink(gi, li, { external: v })
                    }
                  />
                  <span className="text-xs text-muted-foreground">External</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Move link up"
                    disabled={li === 0}
                    onClick={() => moveLink(gi, li, -1)}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Move link down"
                    disabled={li === group.links.length - 1}
                    onClick={() => moveLink(gi, li, 1)}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove link"
                    onClick={() =>
                      updateGroup(gi, {
                        links: group.links.filter((_, i) => i !== li),
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                updateGroup(gi, { links: [...group.links, emptyLink()] })
              }
            >
              <Plus className="mr-1 size-4" />
              Add link
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Bottom bar</h2>
        <div>
          <Label htmlFor="copyright">Copyright text</Label>
          <Input
            id="copyright"
            className="mt-1"
            value={footer.copyrightText}
            onChange={(e) =>
              setFooter({ ...footer, copyrightText: e.target.value })
            }
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Use {"{year}"} for the current year at render time.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bottom links</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFooter((prev) => ({
                  ...prev,
                  bottomLinks: [...prev.bottomLinks, emptyLink()],
                }))
              }
            >
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </div>
          {footer.bottomLinks.map((link, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <Input
                className="min-w-32 flex-1"
                placeholder="Label"
                value={link.label}
                onChange={(e) =>
                  updateBottomLink(i, { label: e.target.value })
                }
              />
              <Input
                className="min-w-32 flex-1"
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateBottomLink(i, { url: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove bottom link"
                onClick={() =>
                  setFooter((prev) => ({
                    ...prev,
                    bottomLinks: prev.bottomLinks.filter((_, j) => j !== i),
                  }))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save footer"}
      </Button>
      </AdminFormWidth>
    </AdminPage>
  );
}
