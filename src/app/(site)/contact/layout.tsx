import type { Metadata } from "next";
import { getContactPageContent } from "@/lib/content-db";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getContactPageContent();
    return { title: page.metaTitle, description: page.metaDescription };
  } catch (err) {
    console.error("[contact/layout] generateMetadata failed", err);
    return {
      title: "Contact Us",
      description:
        "Get in touch with our ERPSuite team. We're here to answer your questions and help with your business needs.",
    };
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
