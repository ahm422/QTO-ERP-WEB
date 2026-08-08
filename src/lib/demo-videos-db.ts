import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { DemoVideoStatus } from "@/db/enums";
import { demoVideos } from "@/db/schema";
import { getDb } from "@/lib/db";

export type DemoVideo = InferSelectModel<typeof demoVideos>;

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
  const conditions = [
    eq(demoVideos.status, "PUBLISHED"),
    isNotNull(demoVideos.publishedAt),
  ];
  if (options?.moduleSlug) {
    conditions.push(eq(demoVideos.moduleSlug, options.moduleSlug));
  }

  return await (await getDb())
    .select()
    .from(demoVideos)
    .where(and(...conditions))
    .orderBy(asc(demoVideos.sortOrder), desc(demoVideos.publishedAt));
}

export async function listAllDemoVideos() {
  const rows = await (await getDb())
    .select()
    .from(demoVideos)
    .orderBy(asc(demoVideos.sortOrder), desc(demoVideos.createdAt));
  return rows.map(serializeAdmin);
}

export async function getDemoVideoById(id: string) {
  const [row] = await (await getDb())
    .select()
    .from(demoVideos)
    .where(eq(demoVideos.id, id))
    .limit(1);
  return row ?? null;
}

export async function getDemoVideoBySlug(slug: string) {
  const [row] = await (await getDb())
    .select()
    .from(demoVideos)
    .where(eq(demoVideos.slug, slug))
    .limit(1);
  return row ?? null;
}

export type CreateDemoVideoDraftInput = {
  slug: string;
  title: string;
  objectKey: string;
  contentType: string;
  moduleSlug?: string | null;
};

export async function createDemoVideoDraft(data: CreateDemoVideoDraftInput) {
  const [row] = await (await getDb())
    .insert(demoVideos)
    .values({
      slug: data.slug,
      title: data.title,
      objectKey: data.objectKey,
      contentType: data.contentType,
      moduleSlug: data.moduleSlug ?? null,
      status: "DRAFT",
    })
    .returning();
  return row;
}

export async function publishDemoVideo(id: string) {
  const [row] = await (await getDb())
    .update(demoVideos)
    .set({
      status: "PUBLISHED",
      publishedAt: new Date(),
    })
    .where(eq(demoVideos.id, id))
    .returning();
  return serializeAdmin(row);
}

export async function unpublishDemoVideo(id: string) {
  const [row] = await (await getDb())
    .update(demoVideos)
    .set({
      status: "DRAFT",
      publishedAt: null,
    })
    .where(eq(demoVideos.id, id))
    .returning();
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
  const [row] = await (await getDb())
    .update(demoVideos)
    .set(fields)
    .where(eq(demoVideos.id, id))
    .returning();
  return serializeAdmin(row);
}

export function serializeDemoVideoPublic(row: DemoVideo): DemoVideoPublic {
  return serializePublic(row);
}

export function serializeDemoVideoAdmin(row: DemoVideo): DemoVideoAdmin {
  return serializeAdmin(row);
}
