import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getPageHeroContent,
  upsertPageHeroContentAdmin,
} from "@/lib/content-db";
import {
  PAGE_HERO_KEY_ABOUT,
  PAGE_HERO_KEY_BLOG,
  PAGE_HERO_KEY_CONTACT,
} from "@/lib/page-hero-defaults";
import { requireAdminApi } from "@/lib/require-admin-api";
import {
  parsePageHeroPageKey,
  upsertPageHeroContentSchema,
} from "@/lib/validations/admin-page-hero";

function revalidateForPageKey(pageKey: string) {
  revalidatePath("/", "layout");
  if (pageKey === PAGE_HERO_KEY_BLOG) revalidatePath("/blog");
  if (pageKey === PAGE_HERO_KEY_ABOUT) revalidatePath("/about");
  if (pageKey === PAGE_HERO_KEY_CONTACT) revalidatePath("/contact");
}

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const pageKey = parsePageHeroPageKey(
    new URL(request.url).searchParams.get("pageKey"),
  );
  if (!pageKey) {
    return jsonError("Invalid or missing pageKey", 400);
  }

  try {
    const hero = await getPageHeroContent(pageKey);
    return NextResponse.json({ ok: true, pageKey, hero });
  } catch (err) {
    console.error("[api/admin/page-hero GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const pageKey = parsePageHeroPageKey(
    new URL(request.url).searchParams.get("pageKey"),
  );
  if (!pageKey) {
    return jsonError("Invalid or missing pageKey", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = upsertPageHeroContentSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const hero = await upsertPageHeroContentAdmin(pageKey, parsed.data);
    revalidateForPageKey(pageKey);
    return NextResponse.json({ ok: true, pageKey, hero });
  } catch (err) {
    console.error("[api/admin/page-hero PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
