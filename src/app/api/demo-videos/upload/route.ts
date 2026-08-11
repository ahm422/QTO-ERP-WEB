import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { erpModules } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { createDemoVideoDraft } from "@/lib/demo-videos-db";
import { getDb } from "@/lib/db";
import { isSqliteUniqueConstraintError } from "@/lib/db-errors";
import { requireRole } from "@/lib/permissions";
import { requireMediaBucket } from "@/lib/require-media-bucket";
import {
  buildObjectKey,
  uploadDemoVideoSchema,
} from "@/lib/validations/demo-video";


export async function POST(request: Request) {
  const admin = await requireRole(request, "content:create");
  if ("error" in admin) return admin.error;

  const mediaResult = await requireMediaBucket();
  if ("error" in mediaResult) return mediaResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = uploadDemoVideoSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { slug, title, contentType, fileName, moduleSlug } = parsed.data;

  if (moduleSlug) {
    const [erpModule] = await (await getDb())
      .select()
      .from(erpModules)
      .where(eq(erpModules.slug, moduleSlug))
      .limit(1);
    if (!erpModule) {
      return jsonError("ERP module not found", 400);
    }
  }

  const objectKey = buildObjectKey(slug, fileName, contentType);

  try {
    const video = await createDemoVideoDraft({
      slug,
      title,
      objectKey,
      contentType,
      moduleSlug: moduleSlug ?? null,
    });

    return NextResponse.json(
      {
        ok: true,
        video: {
          id: video.id,
          slug: video.slug,
          objectKey: video.objectKey,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    if (isSqliteUniqueConstraintError(err)) {
      return jsonError("Slug already in use", 409);
    }

    console.error("[api/demo-videos/upload] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
