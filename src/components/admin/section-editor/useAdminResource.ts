"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";

type ItemEnvelope = { ok: true; item: Record<string, unknown> };

/**
 * Shared loader/saver for the per-section module & solution editors. Every
 * section page GETs the full admin object once and PUTs only the slice it owns
 * (the admin PUT handlers accept partial payloads).
 */
export function useAdminResource(url: string) {
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<ItemEnvelope>(url);
      setItem(data.item);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load",
      );
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(
    async (patch: Record<string, unknown>, successMessage = "Saved") => {
      setSaving(true);
      try {
        const data = await adminFetch<ItemEnvelope>(url, {
          method: "PUT",
          json: patch,
        });
        setItem(data.item);
        toast.success(successMessage);
        return true;
      } catch (err) {
        toast.error(
          err instanceof AdminFetchError ? err.message : "Failed to save",
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [url],
  );

  return { item, loading, saving, save, reload };
}

/**
 * Seed a typed local form from the loaded admin object, re-seeding whenever it
 * changes (e.g. after a save round-trip).
 */
export function useSectionForm<T>(
  item: Record<string, unknown> | null,
  map: (item: Record<string, unknown>) => T,
): [T | null, (next: T) => void, (patch: Partial<T>) => void] {
  const [form, setForm] = useState<T | null>(null);
  useEffect(() => {
    setForm(item ? map(item) : null);
    // map is expected to be a stable module-scope function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);
  const patch = useCallback(
    (p: Partial<T>) => setForm((f) => (f ? { ...f, ...p } : f)),
    [],
  );
  return [form, setForm, patch];
}

/** "" -> null, trimmed otherwise. For optional text columns. */
export function nullifyEmpty(v: string): string | null {
  const t = v.trim();
  return t.length ? t : null;
}

export function str(v: unknown): string {
  return v == null ? "" : String(v);
}
