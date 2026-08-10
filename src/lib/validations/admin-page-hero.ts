import { z } from "zod";
import {
  PAGE_HERO_KEYS,
  type PageHeroPageKey,
} from "@/lib/page-hero-defaults";

export const pageHeroPageKeySchema = z.enum(PAGE_HERO_KEYS);

export const pageHeroContentSchema = z
  .object({
    eyebrow: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(120),
    subtitle: z.string().trim().min(1).max(500),
  })
  .strict();

export const upsertPageHeroContentSchema = pageHeroContentSchema;

export type UpsertPageHeroContentInput = z.infer<
  typeof upsertPageHeroContentSchema
>;

export function parsePageHeroPageKey(
  value: string | null,
): PageHeroPageKey | null {
  if (!value) return null;
  const parsed = pageHeroPageKeySchema.safeParse(value.trim());
  return parsed.success ? parsed.data : null;
}
