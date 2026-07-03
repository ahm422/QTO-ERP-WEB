import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublishedBlogPostBySlug } from "@/lib/content-db";

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
    <article className="section-padding">
      <div className="container-main max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <span className="text-xs font-semibold text-accent uppercase">
          {post.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">
          {post.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{publishedDate}</p>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
