import type {
  BlogPostDetail,
  BlogPostSummary,
  ModuleDetail,
  ModuleSummary,
  SolutionDetail,
  SolutionSummary,
} from "@/types/content";

export function getBaseUrl(): string {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    next: { revalidate: 3600 },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchModules(): Promise<ModuleSummary[]> {
  const data = await fetchJson<{ modules: ModuleSummary[] }>("/api/modules");
  return data?.modules ?? [];
}

export async function fetchModule(slug: string): Promise<ModuleDetail | null> {
  return fetchJson<ModuleDetail>(`/api/modules/${slug}`);
}

export async function fetchSolutions(): Promise<SolutionSummary[]> {
  const data = await fetchJson<{ solutions: SolutionSummary[] }>("/api/solutions");
  return data?.solutions ?? [];
}

export async function fetchSolution(slug: string): Promise<SolutionDetail | null> {
  return fetchJson<SolutionDetail>(`/api/solutions/${slug}`);
}

export async function fetchBlogPosts(): Promise<BlogPostSummary[]> {
  const data = await fetchJson<{ posts: BlogPostSummary[] }>("/api/blog");
  return data?.posts ?? [];
}

export async function fetchBlogPost(slug: string): Promise<BlogPostDetail | null> {
  return fetchJson<BlogPostDetail>(`/api/blog/${slug}`);
}

export async function fetchBlogCategories(): Promise<
  { name: string; count: number }[]
> {
  const data = await fetchJson<{ categories: { name: string; count: number }[] }>(
    "/api/blog/categories",
  );
  return data?.categories ?? [];
}

export async function fetchPopularBlogPosts(
  limit = 5,
): Promise<BlogPostSummary[]> {
  const data = await fetchJson<{ posts: BlogPostSummary[] }>(
    `/api/blog/popular?limit=${limit}`,
  );
  return data?.posts ?? [];
}

export async function fetchRelatedBlogPosts(
  slug: string,
  category?: string,
  limit = 3,
): Promise<BlogPostSummary[]> {
  const params = new URLSearchParams({ slug, limit: String(limit) });
  if (category) params.set("category", category);
  const data = await fetchJson<{ posts: BlogPostSummary[] }>(
    `/api/blog/related?${params}`,
  );
  return data?.posts ?? [];
}

