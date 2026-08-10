import { revalidatePath } from "next/cache";

export function revalidateModulePaths(slug?: string) {
  if (slug) {
    revalidatePath(`/erp/${slug}`);
  }
  revalidatePath("/");
  revalidatePath("/allApps");
}

export function revalidateSolutionPaths(slug?: string) {
  if (slug) {
    revalidatePath(`/solution/${slug}`);
  }
  revalidatePath("/");
}
