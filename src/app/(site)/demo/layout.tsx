import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "demo",
  description: "View our demo and see how our platform works.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
