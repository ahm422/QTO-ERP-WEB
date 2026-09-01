import { redirect } from "next/navigation";

export default async function SolutionEditIndex({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/admin/solutions/${slug}/edit/basics`);
}
