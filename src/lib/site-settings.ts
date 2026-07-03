import { getDb } from "@/lib/db";
import { siteSettings } from "@/db/schema";

export const SITE_SETTING_DEFAULTS: Record<string, string> = {
  logo_url: "",
  site_name: "QTO-ERP",
  cta_label: "Book Demo",
  cta_url: "/demo",
  cta_visible: "true",
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  const rows = await getDb().select().from(siteSettings);
  const result = { ...SITE_SETTING_DEFAULTS };
  for (const r of rows) result[r.key] = r.value;
  return result;
}

export async function setSiteSetting(key: string, value: string) {
  const [row] = await getDb()
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value },
    })
    .returning();
  return row;
}
