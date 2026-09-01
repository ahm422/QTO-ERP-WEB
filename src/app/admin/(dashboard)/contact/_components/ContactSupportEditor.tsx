"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { ALLOWED_CONTACT_ICON_KEYS } from "@/lib/icon-map";
import type { ContactSupportContent } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyCard = () => ({
  iconKey: "clock",
  title: "",
  description: "",
});

export function ContactSupportEditor() {
  const [support, setSupport] = useState<ContactSupportContent>({
    tag: "",
    title: "",
    description: "",
    knowledgeBaseLabel: "",
    knowledgeBaseHref: "",
    cards: [],
    responseTimes: { typical: "", priority: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; support: ContactSupportContent }>(
        "/api/admin/contact/support",
      );
      setSupport(data.support);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load support content",
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
      const data = await adminFetch<{ ok: true; support: ContactSupportContent }>(
        "/api/admin/contact/support",
        { method: "PUT", json: support },
      );
      setSupport(data.support);
      toast.success("Support section saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6 rounded-md border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="support-tag">Tag</Label>
          <Input
            id="support-tag"
            className="mt-1"
            value={support.tag}
            onChange={(e) =>
              setSupport((s) => ({ ...s, tag: e.target.value }))
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="support-title">Title</Label>
          <Input
            id="support-title"
            className="mt-1"
            value={support.title}
            onChange={(e) =>
              setSupport((s) => ({ ...s, title: e.target.value }))
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="support-description">Description</Label>
          <Textarea
            id="support-description"
            className="mt-1"
            rows={2}
            value={support.description}
            onChange={(e) =>
              setSupport((s) => ({ ...s, description: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="kb-label">Knowledge base link label</Label>
          <Input
            id="kb-label"
            className="mt-1"
            value={support.knowledgeBaseLabel}
            onChange={(e) =>
              setSupport((s) => ({
                ...s,
                knowledgeBaseLabel: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor="kb-href">Knowledge base link URL</Label>
          <Input
            id="kb-href"
            className="mt-1"
            placeholder="/blog or https://…"
            value={support.knowledgeBaseHref}
            onChange={(e) =>
              setSupport((s) => ({
                ...s,
                knowledgeBaseHref: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Support cards</h3>
        {support.cards.map((card, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-md border p-3 sm:grid-cols-2"
          >
            <div>
              <Label>Icon</Label>
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={card.iconKey}
                onChange={(e) =>
                  setSupport((s) => ({
                    ...s,
                    cards: s.cards.map((c, i) =>
                      i === index ? { ...c, iconKey: e.target.value } : c,
                    ),
                  }))
                }
              >
                {ALLOWED_CONTACT_ICON_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={card.title}
                onChange={(e) =>
                  setSupport((s) => ({
                    ...s,
                    cards: s.cards.map((c, i) =>
                      i === index ? { ...c, title: e.target.value } : c,
                    ),
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={card.description}
                onChange={(e) =>
                  setSupport((s) => ({
                    ...s,
                    cards: s.cards.map((c, i) =>
                      i === index ? { ...c, description: e.target.value } : c,
                    ),
                  }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() =>
                  setSupport((s) => ({
                    ...s,
                    cards: s.cards.filter((_, i) => i !== index),
                  }))
                }
              >
                <Trash2 className="mr-1 size-4" />
                Remove card
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setSupport((s) => ({ ...s, cards: [...s.cards, emptyCard()] }))
          }
        >
          <Plus className="mr-1 size-4" />
          Add card
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="response-typical">Typical response time</Label>
          <Input
            id="response-typical"
            className="mt-1"
            value={support.responseTimes.typical}
            onChange={(e) =>
              setSupport((s) => ({
                ...s,
                responseTimes: { ...s.responseTimes, typical: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor="response-priority">Priority response time</Label>
          <Input
            id="response-priority"
            className="mt-1"
            value={support.responseTimes.priority}
            onChange={(e) =>
              setSupport((s) => ({
                ...s,
                responseTimes: {
                  ...s.responseTimes,
                  priority: e.target.value,
                },
              }))
            }
          />
        </div>
      </div>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save support section"}
      </Button>
    </div>
  );
}
