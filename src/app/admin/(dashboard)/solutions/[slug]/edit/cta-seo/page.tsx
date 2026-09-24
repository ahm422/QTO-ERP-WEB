import { redirect } from "next/navigation";

export default async function SolutionCtaSeoRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/admin/solutions/${slug}/edit/tabs`);
}
