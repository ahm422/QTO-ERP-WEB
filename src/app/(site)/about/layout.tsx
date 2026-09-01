import type { Metadata } from "next";
import { getAboutStory } from "@/lib/content-db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const story = await getAboutStory();
    return { title: story.metaTitle, description: story.metaDescription };
  } catch (err) {
    console.error("[about/layout] generateMetadata failed", err);
    return {
      title: "about",
      description: "View our about page and see how our platform works.",
    };
  }
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
