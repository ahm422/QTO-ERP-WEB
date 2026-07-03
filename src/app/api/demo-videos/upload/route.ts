import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { createDemoVideoDraft } from "@/lib/demo-videos-db";
import { presignPutObject } from "@/lib/garage";
import { getPrisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";
import { requireGarage } from "@/lib/require-garage";
import {
  buildObjectKey,
  uploadDemoVideoSchema,
} from "@/lib/validations/demo-video";


export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const garageResult = requireGarage();
  if ("error" in garageResult) return garageResult.error;

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
    const erpModule = await getPrisma().erpModule.findUnique({
      where: { slug: moduleSlug },
    });
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

    const presigned = await presignPutObject(objectKey, contentType);
    if (!presigned) {
      console.error("[api/demo-videos/upload] Failed to presign PUT");
      return jsonError("Something went wrong.", 500);
    }

    return NextResponse.json(
      {
        ok: true,
        video: {
          id: video.id,
          slug: video.slug,
          objectKey: video.objectKey,
        },
        uploadUrl: presigned.uploadUrl,
        expiresIn: presigned.expiresIn,
      },
      { status: 201 },
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return jsonError("Slug already in use", 409);
    }

    console.error("[api/demo-videos/upload] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
