import type { Metadata } from "next";
import { listPublishedSolutionsFull } from "@/lib/content-db";
import AllSolutionsGrid from "./_components/AllSolutionsGrid";

export const metadata: Metadata = {
  title: "Solutions | QTO ERP",
  description:
    "QTO ERP solutions for HR teams, project teams, and business owners — tailored workflows for every industry.",
};

export default async function SolutionsPage() {
  const solutions = await listPublishedSolutionsFull();
  return <AllSolutionsGrid solutions={solutions} />;
}
