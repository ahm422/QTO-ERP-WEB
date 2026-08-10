"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PAGE_HERO_KEY_CONTACT } from "@/lib/page-hero-defaults";
import { FAQ_PAGE_KEY_CONTACT } from "@/lib/faqs-defaults";
import { cn } from "@/lib/utils";
import { ContactChannelsEditor } from "./_components/ContactChannelsEditor";
import { ContactFormEditor } from "./_components/ContactFormEditor";
import { ContactSupportEditor } from "./_components/ContactSupportEditor";

const TABS = [
  { key: "support", label: "Support" },
  { key: "channels", label: "Channels" },
  { key: "form", label: "Form" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTabKey(value: string): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

function ContactAdminInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab")?.trim() || "support";
  const tab: TabKey = isTabKey(raw) ? raw : "support";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contact page</h1>
        <p className="text-sm text-muted-foreground">
          Edit support cards, contact channels, and form copy for{" "}
          <code className="text-xs">/contact</code>. Hero copy lives under{" "}
          <Link
            href={`/admin/page-hero?pageKey=${PAGE_HERO_KEY_CONTACT}`}
            className="underline underline-offset-2"
          >
            Page heroes
          </Link>
          ; FAQ items under{" "}
          <Link
            href={`/admin/faqs?pageKey=${FAQ_PAGE_KEY_CONTACT}`}
            className="underline underline-offset-2"
          >
            FAQs
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Link
            key={item.key}
            href={`/admin/contact?tab=${item.key}`}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              tab === item.key
                ? "border-primary bg-primary/10 font-medium text-foreground"
                : "border-border text-muted-foreground hover:bg-muted/50",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {tab === "support" ? <ContactSupportEditor /> : null}
      {tab === "channels" ? <ContactChannelsEditor /> : null}
      {tab === "form" ? <ContactFormEditor /> : null}
    </div>
  );
}

export default function ContactAdminPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
    >
      <ContactAdminInner />
    </Suspense>
  );
}
