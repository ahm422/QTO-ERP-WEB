import BlogHero from "./_components/BlogHero";
import BlogPosts from "./_components/BlogPosts";
import { listPublishedBlogPosts } from "@/lib/content-db";


export default async function Blog() {
  const posts = await listPublishedBlogPosts();
  return (
    <>
      <BlogHero />
      <BlogPosts posts={posts} />
    </>
  );
}
