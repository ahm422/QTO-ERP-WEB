"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { AdminFormWidth } from "@/components/admin/AdminFormWidth";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type SiteSettings = {
  logo_url: string;
  site_name: string;
  cta_label: string;
  cta_url: string;
  cta_visible: string;
};

const DEFAULTS: SiteSettings = {
  logo_url: "",
  site_name: "QTO-ERP",
  cta_label: "Book Demo",
  cta_url: "/demo",
  cta_visible: "true",
};

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; settings: SiteSettings }>(
        "/api/admin/site-settings",
      );
      setSettings({ ...DEFAULTS, ...data.settings });
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load settings",
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
      const data = await adminFetch<{ ok: true; settings: SiteSettings }>(
        "/api/admin/site-settings",
        {
          method: "PATCH",
          json: {
            site_name: settings.site_name,
            logo_url: settings.logo_url,
            cta_label: settings.cta_label,
            cta_url: settings.cta_url,
            cta_visible: settings.cta_visible,
          },
        },
      );
      setSettings({ ...DEFAULTS, ...data.settings });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <AdminPage spacing="md">
      <AdminFormWidth size="md" className="space-y-6">
      <AdminPageHeader
        title="Site settings"
        description="Control global branding and the header CTA button."
      />

      <div className="space-y-4">
        <div>
          <Label>Site name</Label>
          <Input
            className="mt-1"
            value={settings.site_name}
            onChange={(e) =>
              setSettings({ ...settings, site_name: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Logo URL</Label>
          <Input
            className="mt-1"
            placeholder="https://… (leave empty to use icon logo)"
            value={settings.logo_url}
            onChange={(e) =>
              setSettings({ ...settings, logo_url: e.target.value })
            }
          />
          {settings.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url}
              alt="Logo preview"
              className="mt-2 h-10 w-auto rounded border object-contain"
            />
          )}
        </div>

        <div>
          <Label>CTA label</Label>
          <Input
            className="mt-1"
            placeholder="Book Demo"
            value={settings.cta_label}
            onChange={(e) =>
              setSettings({ ...settings, cta_label: e.target.value })
            }
          />
        </div>

        <div>
          <Label>CTA URL</Label>
          <Input
            className="mt-1"
            placeholder="/demo"
            value={settings.cta_url}
            onChange={(e) =>
              setSettings({ ...settings, cta_url: e.target.value })
            }
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={settings.cta_visible === "true"}
            onCheckedChange={(v) =>
              setSettings({
                ...settings,
                cta_visible: v ? "true" : "false",
              })
            }
          />
          <Label>Show CTA button in header</Label>
        </div>

        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
      </AdminFormWidth>
    </AdminPage>
  );
}
