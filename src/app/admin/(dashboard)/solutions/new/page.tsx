"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewSolutionPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!slug.trim() || !title.trim()) {
      toast.error("Slug and title are required");
      return;
    }
    setCreating(true);
    try {
      const data = await adminFetch<{ ok: true; item: { slug: string } }>(
        "/api/admin/solutions",
        {
          method: "POST",
          json: {
            slug: slug.trim(),
            title: title.trim(),
            audience: "Target audience",
            heroHeadline: title.trim(),
            heroSubheadline: "Solution hero subheadline.",
            problems: [],
            recommendedModules: [],
            testimonial: { quote: "", author: "", role: "" },
            solutionFaqs: [],
            useCases: [],
            published: false,
          },
        },
      );
      toast.success("Solution created");
      router.push(`/admin/solutions/${data.item.slug}/edit`);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to create solution",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New solution</h1>
          <p className="text-sm text-muted-foreground">
            Creates a draft solution with placeholder content.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/solutions">Back</Link>
        </Button>
      </div>
      <div className="space-y-4 rounded-md border p-4">
        <div>
          <Label>Title</Label>
          <Input
            className="mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Construction"
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            className="mt-1 font-mono text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="construction"
          />
        </div>
        <Button type="button" onClick={create} disabled={creating}>
          {creating ? "Creating…" : "Create solution"}
        </Button>
      </div>
    </div>
  );
}
