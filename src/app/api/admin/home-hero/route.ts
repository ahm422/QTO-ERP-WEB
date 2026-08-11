import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getHomeHero,
  listPublishedModulesForHeroAdmin,
  updateHomeHeroAdmin,
  updateModuleOrbitAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { updateHomeHeroSchema } from "@/lib/validations/admin-home-hero";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const [hero, modules] = await Promise.all([
      getHomeHero(),
      listPublishedModulesForHeroAdmin(),
    ]);
    return NextResponse.json({ ok: true, hero, modules });
  } catch (err) {
    console.error("[api/admin/home-hero GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PATCH(request: Request) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateHomeHeroSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { orbitOverrides, ...heroFields } = parsed.data;
  const hasHeroFields = Object.keys(heroFields).length > 0;
  const hasOrbit = (orbitOverrides?.length ?? 0) > 0;

  if (!hasHeroFields && !hasOrbit) {
    return jsonError("No fields to update", 400);
  }

  try {
    if (hasHeroFields) {
      await updateHomeHeroAdmin(heroFields);
    }

    if (orbitOverrides) {
      for (const override of orbitOverrides) {
        const { moduleId, ...fields } = override;
        const patch: Parameters<typeof updateModuleOrbitAdmin>[1] = {};
        if ("orbitRadius" in fields) patch.orbitRadius = fields.orbitRadius ?? null;
        if ("orbitTilt" in fields) patch.orbitTilt = fields.orbitTilt ?? null;
        if ("orbitPhase" in fields) patch.orbitPhase = fields.orbitPhase ?? null;
        if ("orbitSpeed" in fields) patch.orbitSpeed = fields.orbitSpeed ?? null;
        if (fields.sortOrder !== undefined) patch.sortOrder = fields.sortOrder;
        if (fields.showInHeroOrbit !== undefined) {
          patch.showInHeroOrbit = fields.showInHeroOrbit;
        }
        if (Object.keys(patch).length > 0) {
          await updateModuleOrbitAdmin(moduleId, patch);
        }
      }
    }

    revalidatePath("/", "layout");

    const [hero, modules] = await Promise.all([
      getHomeHero(),
      listPublishedModulesForHeroAdmin(),
    ]);
    return NextResponse.json({ ok: true, hero, modules });
  } catch (err) {
    console.error("[api/admin/home-hero PATCH] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
