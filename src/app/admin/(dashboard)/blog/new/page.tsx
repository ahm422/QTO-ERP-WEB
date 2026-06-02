import Link from "next/link";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { Button } from "@/components/ui/button";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New blog post</h1>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/blog">Back</Link>
        </Button>
      </div>
      <BlogPostForm mode="create" />
    </div>
  );
}
