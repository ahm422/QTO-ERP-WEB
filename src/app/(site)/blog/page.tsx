import { Suspense } from "react";
import type { Metadata } from "next";
import BlogHero from "./_components/BlogHero";
import BlogPosts from "./_components/BlogPosts";
import BlogSidebar from "./_components/BlogSidebar";
import CategoryFilter from "./_components/CategoryFilter";
import FeaturedPosts from "./_components/FeaturedPosts";
import {
  getPageHeroContent,
  listFeaturedBlogPosts,
  listPopularBlogPosts,
  listPublishedBlogCategories,
  listPublishedBlogPosts,
} from "@/lib/content-db";
import { PAGE_HERO_KEY_BLOG } from "@/lib/page-hero-defaults";

export const metadata: Metadata = {
  title: "Blog | QTO ERP",
  description:
    "Insights on construction ERP, project controls, and running a tighter operation with QTO ERP.",
};

type PageProps = {
  searchParams: Promise<{ category?: string; tag?: string }>;
};

export default async function Blog({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;

  const [result, hero, featured, categories, popular] = await Promise.all([
    listPublishedBlogPosts({ page: 1, limit: 9, category, tag }),
    getPageHeroContent(PAGE_HERO_KEY_BLOG),
    listFeaturedBlogPosts(2),
    listPublishedBlogCategories(),
    listPopularBlogPosts(5),
  ]);

  return (
    <>
      <BlogHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
      />
      <section className="section-padding bg-background">
        <div className="container-main max-w-7xl">
          <Suspense>
            <CategoryFilter categories={categories} />
          </Suspense>
          <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
            <div>
              {!category && !tag ? (
                <FeaturedPosts posts={featured} />
              ) : null}
              <BlogPosts
                initialPosts={result.posts}
                initialHasMore={result.hasMore}
                category={category}
                tag={tag}
              />
            </div>
            <BlogSidebar popular={popular} />
          </div>
        </div>
      </section>
    </>
  );
}
