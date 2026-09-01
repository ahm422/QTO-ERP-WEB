import { redirect } from "next/navigation";

export default async function ModuleEditIndex({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/admin/modules/${slug}/edit/basics`);
}
