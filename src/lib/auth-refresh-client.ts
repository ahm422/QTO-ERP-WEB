export type RefreshSessionResult = {
  accessToken: string;
  email: string;
  role: string;
};

let accessToken: string | null = null;
let refreshInFlight: Promise<RefreshSessionResult | null> | null = null;
let pageBootstrap: Promise<RefreshSessionResult | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

async function postRefresh(): Promise<RefreshSessionResult | null> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as RefreshSessionResult;
    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  } catch {
    return null;
  }
}

/** Once per full page load — safe under React Strict Mode double-mount. */
export function bootstrapSessionFromCookie(): Promise<RefreshSessionResult | null> {
  pageBootstrap ??= postRefresh();
  return pageBootstrap;
}

/** On-demand refresh (e.g. adminFetch 401 retry). */
export async function refreshAccessToken(): Promise<RefreshSessionResult | null> {
  if (!refreshInFlight) {
    refreshInFlight = postRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export function resetAuthClientState(): void {
  accessToken = null;
  refreshInFlight = null;
  pageBootstrap = null;
}
