import BlogHero from "./_components/BlogHero";
import BlogPosts from "./_components/BlogPosts";
import {
  getPageHeroContent,
  listPublishedBlogPosts,
} from "@/lib/content-db";
import { PAGE_HERO_KEY_BLOG } from "@/lib/page-hero-defaults";

export default async function Blog() {
  const [posts, hero] = await Promise.all([
    listPublishedBlogPosts(),
    getPageHeroContent(PAGE_HERO_KEY_BLOG),
  ]);
  return (
    <>
      <BlogHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
      />
      <BlogPosts posts={posts} />
    </>
  );
}
