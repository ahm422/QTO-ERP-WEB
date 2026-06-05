import { getPrisma } from "@/lib/prisma";

export const SITE_SETTING_DEFAULTS: Record<string, string> = {
  logo_url: "",
  site_name: "QTO-ERP",
  cta_label: "Book Demo",
  cta_url: "/demo",
  cta_visible: "true",
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  const rows = await getPrisma().siteSetting.findMany();
  const result = { ...SITE_SETTING_DEFAULTS };
  for (const r of rows) result[r.key] = r.value;
  return result;
}

export async function setSiteSetting(key: string, value: string) {
  return getPrisma().siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
