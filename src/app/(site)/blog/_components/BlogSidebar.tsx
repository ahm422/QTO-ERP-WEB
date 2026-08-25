"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import type { BlogPostSummary } from "@/types/content";
import { MarketingButton } from "@/components/ui/marketing-button";

type BlogSidebarProps = {
  popular: BlogPostSummary[];
};

export default function BlogSidebar({ popular }: BlogSidebarProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "duplicate" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.status === 409) {
        setStatus("duplicate");
        setMessage(data.error ?? "Already subscribed");
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setEmail("");
      setMessage("Thanks for subscribing.");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="mt-10 space-y-8 lg:mt-0">
      <div>
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">
          Popular
        </h2>
        <ul className="space-y-3">
          {popular.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex gap-3 rounded-md p-1 hover:bg-muted/60"
              >
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="h-14 w-16 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-14 w-16 shrink-0 rounded bg-muted" />
                )}
                <span className="text-sm font-medium leading-snug text-foreground">
                  {post.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Mail className="h-4 w-4 text-accent" />
          Newsletter
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Get construction ERP insights in your inbox.
        </p>
        <form onSubmit={handleSubscribe} className="space-y-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <MarketingButton
            type="submit"
            size="sm"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Subscribing…" : "Subscribe"}
          </MarketingButton>
        </form>
        {status !== "idle" && message ? (
          <p
            className={`mt-2 text-xs ${
              status === "success"
                ? "text-foreground"
                : "text-destructive"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
