"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { AdminFormWidth } from "@/components/admin/AdminFormWidth";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HOME_HERO_DEFAULTS } from "@/lib/home-hero-defaults";
import type { HeroOrbitModule, HomeHero } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type AdminPayload = {
  ok: true;
  hero: HomeHero;
  modules: HeroOrbitModule[];
};

function sortModules(mods: HeroOrbitModule[]) {
  return [...mods].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}

export default function HomeHeroAdminPage() {
  const [hero, setHero] = useState<HomeHero>({ ...HOME_HERO_DEFAULTS });
  const [modules, setModules] = useState<HeroOrbitModule[]>([]);
  const [newBullet, setNewBullet] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<AdminPayload>("/api/admin/home-hero");
      setHero({ ...HOME_HERO_DEFAULTS, ...data.hero });
      setModules(sortModules(data.modules));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load home hero",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const moveModule = (index: number, dir: -1 | 1) => {
    const next = sortModules(modules);
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const a = next[index];
    const b = next[j];
    const aOrder = a.sortOrder;
    next[index] = { ...a, sortOrder: b.sortOrder };
    next[j] = { ...b, sortOrder: aOrder };
    // Ensure distinct consecutive orders after swap
    next.forEach((m, i) => {
      m.sortOrder = i;
    });
    setModules([...next]);
  };

  const updateModule = (
    id: string,
    patch: Partial<HeroOrbitModule>,
  ) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const orbitOverrides = modules.map((m) => ({
        moduleId: m.id,
        orbitRadius: m.orbitRadius,
        orbitTilt: m.orbitTilt,
        orbitPhase: m.orbitPhase,
        orbitSpeed: m.orbitSpeed,
        sortOrder: m.sortOrder,
        showInHeroOrbit: m.showInHeroOrbit,
      }));

      const data = await adminFetch<AdminPayload>("/api/admin/home-hero", {
        method: "PATCH",
        json: {
          eyebrowText: hero.eyebrowText,
          titleLine1: hero.titleLine1,
          titleAccent: hero.titleAccent,
          subtitle: hero.subtitle,
          bullets: hero.bullets,
          primaryCtaLabel: hero.primaryCtaLabel,
          primaryCtaUrl: hero.primaryCtaUrl,
          secondaryCtaLabel: hero.secondaryCtaLabel,
          secondaryCtaUrl: hero.secondaryCtaUrl,
          poweredByText: hero.poweredByText,
          poweredByUrl: hero.poweredByUrl,
          orbitOverrides,
        },
      });
      setHero({ ...HOME_HERO_DEFAULTS, ...data.hero });
      setModules(sortModules(data.modules));
      toast.success("Home hero saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save home hero",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <AdminPage>
      <AdminFormWidth size="lg" className="space-y-8">
      <AdminPageHeader
        title="Home hero"
        description="Edit marketing hero copy and orbit constellation layout. Orbit nodes come from published ERP modules."
      />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Copy</h2>

        <div>
          <Label>Eyebrow</Label>
          <Input
            className="mt-1"
            value={hero.eyebrowText}
            onChange={(e) => setHero({ ...hero, eyebrowText: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Title line 1</Label>
            <Input
              className="mt-1"
              value={hero.titleLine1}
              onChange={(e) =>
                setHero({ ...hero, titleLine1: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Title accent</Label>
            <Input
              className="mt-1"
              value={hero.titleAccent}
              onChange={(e) =>
                setHero({ ...hero, titleAccent: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label>Subtitle</Label>
          <Textarea
            className="mt-1"
            rows={3}
            value={hero.subtitle}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
          />
        </div>

        <div>
          <Label>Bullets</Label>
          <ul className="mt-2 space-y-2">
            {hero.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <Input
                  value={b}
                  onChange={(e) => {
                    const bullets = [...hero.bullets];
                    bullets[i] = e.target.value;
                    setHero({ ...hero, bullets });
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setHero({
                      ...hero,
                      bullets: hero.bullets.filter((_, j) => j !== i),
                    })
                  }
                  disabled={hero.bullets.length <= 1}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="New bullet"
              value={newBullet}
              onChange={(e) => setNewBullet(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!newBullet.trim() || hero.bullets.length >= 12) return;
                setHero({
                  ...hero,
                  bullets: [...hero.bullets, newBullet.trim()],
                });
                setNewBullet("");
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">CTAs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Primary label</Label>
            <Input
              className="mt-1"
              value={hero.primaryCtaLabel}
              onChange={(e) =>
                setHero({ ...hero, primaryCtaLabel: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Primary URL</Label>
            <Input
              className="mt-1"
              value={hero.primaryCtaUrl}
              onChange={(e) =>
                setHero({ ...hero, primaryCtaUrl: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Secondary label</Label>
            <Input
              className="mt-1"
              value={hero.secondaryCtaLabel}
              onChange={(e) =>
                setHero({ ...hero, secondaryCtaLabel: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Secondary URL</Label>
            <Input
              className="mt-1"
              value={hero.secondaryCtaUrl}
              onChange={(e) =>
                setHero({ ...hero, secondaryCtaUrl: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Powered-by text</Label>
            <Input
              className="mt-1"
              value={hero.poweredByText}
              onChange={(e) =>
                setHero({ ...hero, poweredByText: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Powered-by URL</Label>
            <Input
              className="mt-1"
              value={hero.poweredByUrl}
              onChange={(e) =>
                setHero({ ...hero, poweredByUrl: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Orbit modules</h2>
          <p className="text-sm text-muted-foreground">
            Published modules appear here automatically. Reorder, tweak orbit
            layout, or hide from the constellation without unpublishing.
          </p>
        </div>

        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published modules yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {sortModules(modules).map((m, index) => (
              <li
                key={m.id}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.slug} · icon: {m.iconKey}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={m.showInHeroOrbit}
                        onCheckedChange={(v) =>
                          updateModule(m.id, { showInHeroOrbit: v })
                        }
                      />
                      <Label className="text-sm">Show in orbit</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => moveModule(index, -1)}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Move down"
                      disabled={index === modules.length - 1}
                      onClick={() => moveModule(index, 1)}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <Label className="text-xs">Sort</Label>
                    <Input
                      type="number"
                      className="mt-1"
                      value={m.sortOrder}
                      onChange={(e) =>
                        updateModule(m.id, {
                          sortOrder: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  {(
                    [
                      ["orbitRadius", "Radius", 0.5, 5, 0.05],
                      ["orbitTilt", "Tilt", -2, 2, 0.05],
                      ["orbitPhase", "Phase", 0, 12.6, 0.05],
                      ["orbitSpeed", "Speed", 0.01, 2, 0.01],
                    ] as const
                  ).map(([key, label, min, max, step]) => (
                    <div key={key}>
                      <Label className="text-xs">
                        {label}
                        {m[key] != null ? ` (${m[key]})` : " (default)"}
                      </Label>
                      <Input
                        type="number"
                        className="mt-1"
                        min={min}
                        max={max}
                        step={step}
                        value={m[key] ?? ""}
                        placeholder="default"
                        onChange={(e) => {
                          const raw = e.target.value;
                          updateModule(m.id, {
                            [key]:
                              raw === "" ? null : Number(raw),
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save home hero"}
      </Button>
      </AdminFormWidth>
    </AdminPage>
  );
}
