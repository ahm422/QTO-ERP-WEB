import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Apps | QTO ERP",
  description:
    "Explore all QTO ERP modules — Attendance, HRM, Project Management, Construction CRM, and more.",
};

export default function AllAppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
