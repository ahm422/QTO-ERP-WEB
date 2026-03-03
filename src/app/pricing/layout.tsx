import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "pricing",
  description: "View our pricing plans and choose the right one for your needs.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
