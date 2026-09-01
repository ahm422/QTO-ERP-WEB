import type { Metadata } from "next";
import { getDemoPageContent } from "@/lib/content-db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getDemoPageContent();
    return { title: page.metaTitle, description: page.metaDescription };
  } catch (err) {
    console.error("[demo/layout] generateMetadata failed", err);
    return {
      title: "demo",
      description: "View our demo and see how our platform works.",
    };
  }
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
