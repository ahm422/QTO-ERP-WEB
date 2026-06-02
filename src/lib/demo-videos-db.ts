import type { DemoVideo, DemoVideoStatus } from "@prisma/client";
import { DemoVideoStatus as DemoVideoStatusEnum } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export type DemoVideoPublic = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  moduleSlug: string | null;
  contentType: string;
  publishedAt: string | null;
};

export type DemoVideoAdmin = DemoVideoPublic & {
  objectKey: string;
  status: DemoVideoStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function serializePublic(row: DemoVideo): DemoVideoPublic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    moduleSlug: row.moduleSlug,
    contentType: row.contentType,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

function serializeAdmin(row: DemoVideo): DemoVideoAdmin {
  return {
    ...serializePublic(row),
    objectKey: row.objectKey,
    status: row.status,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPublishedDemoVideos(options?: {
  moduleSlug?: string;
}) {
  const rows = await getPrisma().demoVideo.findMany({
    where: {
      status: DemoVideoStatusEnum.PUBLISHED,
      publishedAt: { not: null },
      ...(options?.moduleSlug ? { moduleSlug: options.moduleSlug } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
  });
  return rows;
}

export async function listAllDemoVideos() {
  const rows = await getPrisma().demoVideo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(serializeAdmin);
}

export async function getDemoVideoById(id: string) {
  return getPrisma().demoVideo.findUnique({ where: { id } });
}

export async function getDemoVideoBySlug(slug: string) {
  return getPrisma().demoVideo.findUnique({ where: { slug } });
}

export type CreateDemoVideoDraftInput = {
  slug: string;
  title: string;
  objectKey: string;
  contentType: string;
  moduleSlug?: string | null;
};

export async function createDemoVideoDraft(data: CreateDemoVideoDraftInput) {
  const row = await getPrisma().demoVideo.create({
    data: {
      slug: data.slug,
      title: data.title,
      objectKey: data.objectKey,
      contentType: data.contentType,
      moduleSlug: data.moduleSlug ?? null,
      status: DemoVideoStatusEnum.DRAFT,
    },
  });
  return row;
}

export async function publishDemoVideo(id: string) {
  const row = await getPrisma().demoVideo.update({
    where: { id },
    data: {
      status: DemoVideoStatusEnum.PUBLISHED,
      publishedAt: new Date(),
    },
  });
  return serializeAdmin(row);
}

export async function unpublishDemoVideo(id: string) {
  const row = await getPrisma().demoVideo.update({
    where: { id },
    data: {
      status: DemoVideoStatusEnum.DRAFT,
      publishedAt: null,
    },
  });
  return serializeAdmin(row);
}

export type UpdateDemoVideoFields = {
  title?: string;
  description?: string | null;
  sortOrder?: number;
  moduleSlug?: string | null;
};

export async function updateDemoVideo(
  id: string,
  fields: UpdateDemoVideoFields,
) {
  const row = await getPrisma().demoVideo.update({
    where: { id },
    data: fields,
  });
  return serializeAdmin(row);
}

export function serializeDemoVideoPublic(row: DemoVideo): DemoVideoPublic {
  return serializePublic(row);
}

export function serializeDemoVideoAdmin(row: DemoVideo): DemoVideoAdmin {
  return serializeAdmin(row);
}
