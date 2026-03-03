import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "about",
  description: "View our about page and see how our platform works.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
