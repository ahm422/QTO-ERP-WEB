import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import { getPublishedBlogPostBySlug } from "@/lib/content-db";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { CTASection } from "@/components/ui/CTASection";

export const dynamicParams = true;
export const revalidate = 3600; // ISR: revalidate every hour

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <article className="section-padding">
        <div className="container-main max-w-3xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
          <EyebrowBadge icon={Tag} label={post.category} variant="accent" />
          <h1 className="mt-4 mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
            {post.title}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">{publishedDate}</p>
          {post.excerpt && (
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-accent prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
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
