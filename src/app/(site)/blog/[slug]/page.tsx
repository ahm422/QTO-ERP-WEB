import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import {
  getPublishedBlogPostBySlug,
  incrementBlogPostViewCount,
  listRelatedBlogPosts,
} from "@/lib/content-db";
import { BLOG_PROSE_CLASS } from "@/lib/blog-prose";
import { getBaseUrl } from "@/lib/content-api";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { CTASection } from "@/components/ui/CTASection";
import { Card } from "@/components/ui/card";
import { CopyLinkButton } from "../_components/CopyLinkButton";

export const dynamicParams = true;
export const revalidate = 3600; // ISR: revalidate every hour

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function sameCalendarDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}

function absoluteUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${getBaseUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) {
    return { title: "Blog | QTO ERP" };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || post.title;
  const ogImage = absoluteUrl(post.coverImageUrl);

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  void incrementBlogPostViewCount(slug).catch((err) => {
    console.error("[blog/[slug]] Failed to increment viewCount:", err);
  });

  const related = await listRelatedBlogPosts({
    slug: post.slug,
    category: post.category,
    limit: 3,
  });

  const publishedDate = formatDate(post.publishedAt);
  const showUpdated =
    Boolean(post.updatedAt) &&
    !sameCalendarDay(post.publishedAt, post.updatedAt!);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    description: post.metaDescription || post.excerpt || post.title,
    image: absoluteUrl(post.coverImageUrl),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
    author:
      post.authorName === "QTO ERP Team"
        ? { "@type": "Organization", name: "QTO ERP Team" }
        : { "@type": "Person", name: post.authorName },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="section-padding">
        <div className="container-main max-w-3xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImageUrl}
              alt=""
              className="mb-8 aspect-[16/8] w-full rounded-lg object-cover"
            />
          ) : null}
          <EyebrowBadge icon={Tag} label={post.category} variant="accent" />
          <h1 className="mt-4 mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
            {post.title}
          </h1>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <p>
              {post.authorName} · {publishedDate}
              {post.readTimeMinutes ? ` · ${post.readTimeMinutes} min read` : ""}
              {" · "}
              {post.category}
            </p>
            <CopyLinkButton />
          </div>
          {showUpdated ? (
            <p className="mb-6 text-xs text-muted-foreground">
              Last updated {formatDate(post.updatedAt!)}
            </p>
          ) : null}
          {post.excerpt && (
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <div
            className={BLOG_PROSE_CLASS}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}
          {related.length > 0 ? (
            <section className="mt-12">
              <h2 className="mb-4 font-display text-xl font-bold text-foreground">
                Related posts
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.slug} href={`/blog/${item.slug}`}>
                    <Card variant="interactive" radius="lg" padding="none">
                      {item.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverImageUrl}
                          alt=""
                          className="h-28 w-full rounded-t-lg object-cover"
                        />
                      ) : (
                        <div className="h-28 w-full rounded-t-lg bg-muted" />
                      )}
                      <div className="p-3">
                        <h3 className="font-display text-sm font-bold leading-snug">
                          {item.title}
                        </h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>
      <CTASection
        eyebrow="From the blog"
        headline="Want to see QTO-ERP in action?"
        description="Book a short walkthrough tailored to your team — or keep reading more insights."
        primaryLabel="Book a Demo"
        primaryHref="/demo"
        secondaryLabel="Read more posts"
        secondaryHref="/blog"
      />
    </>
  );
}
