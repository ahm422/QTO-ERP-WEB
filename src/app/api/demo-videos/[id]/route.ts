import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { erpModules } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getDemoVideoById,
  publishDemoVideo,
  serializeDemoVideoAdmin,
  unpublishDemoVideo,
  updateDemoVideo,
} from "@/lib/demo-videos-db";
import { getDb } from "@/lib/db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateDemoVideoSchema } from "@/lib/validations/demo-video";


type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateDemoVideoSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const existing = await getDemoVideoById(id);
  if (!existing) {
    return jsonError("Video not found", 404);
  }

  const { title, description, sortOrder, moduleSlug, status } = parsed.data;

  if (moduleSlug !== undefined && moduleSlug !== null) {
    const [erpModule] = await getDb()
      .select()
      .from(erpModules)
      .where(eq(erpModules.slug, moduleSlug))
      .limit(1);
    if (!erpModule) {
      return jsonError("ERP module not found", 400);
    }
  }

  try {
    if (status === "PUBLISHED") {
      if (
        title !== undefined ||
        description !== undefined ||
        sortOrder !== undefined ||
        moduleSlug !== undefined
      ) {
        await updateDemoVideo(id, {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(sortOrder !== undefined ? { sortOrder } : {}),
          ...(moduleSlug !== undefined ? { moduleSlug } : {}),
        });
      }
      const video = await publishDemoVideo(id);
      return NextResponse.json({ ok: true, video });
    }

    if (status === "DRAFT") {
      if (
        title !== undefined ||
        description !== undefined ||
        sortOrder !== undefined ||
        moduleSlug !== undefined
      ) {
        await updateDemoVideo(id, {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(sortOrder !== undefined ? { sortOrder } : {}),
          ...(moduleSlug !== undefined ? { moduleSlug } : {}),
        });
      }
      const video = await unpublishDemoVideo(id);
      return NextResponse.json({ ok: true, video });
    }

    if (
      title !== undefined ||
      description !== undefined ||
      sortOrder !== undefined ||
      moduleSlug !== undefined
    ) {
      const video = await updateDemoVideo(id, {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        ...(moduleSlug !== undefined ? { moduleSlug } : {}),
      });
      return NextResponse.json({ ok: true, video });
    }

    return NextResponse.json({
      ok: true,
      video: serializeDemoVideoAdmin(existing),
    });
  } catch (err) {
    console.error("[api/demo-videos/[id]] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
