import { csrfHeaders, getCsrfTokenFromDocument } from "@/lib/csrf-client";

export class AdminFetchError extends Error {
  status: number;
  details?: Record<string, string[] | undefined>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = "AdminFetchError";
    this.status = status;
    this.details = details;
  }
}

type AdminFetchOptions = Omit<RequestInit, "body" | "credentials"> & {
  json?: unknown;
  _retry?: boolean;
};

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

export async function adminFetch<T>(
  url: string,
  options: AdminFetchOptions = {},
): Promise<T> {
  const { json, headers, _retry, method = "GET", ...rest } = options;
  const normalizedMethod = method.toUpperCase();
  const isMutating = MUTATING_METHODS.has(normalizedMethod);

  const response = await fetch(url, {
    ...rest,
    method: normalizedMethod,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(isMutating ? csrfHeaders() : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (response.status === 401 && !_retry) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return adminFetch<T>(url, { ...options, _retry: true });
    }
    redirectToLogin();
    throw new AdminFetchError("Unauthorized", 401);
  }

  let data: unknown;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || response.statusText };
  }

  if (!response.ok) {
    const payload = data as {
      error?: string;
      details?: Record<string, string[] | undefined>;
    };
    throw new AdminFetchError(
      payload.error ?? `Request failed (${response.status})`,
      response.status,
      payload.details,
    );
  }

  return data as T;
}

export async function adminLogout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: csrfHeaders(),
  });
  redirectToLogin();
}

export { getCsrfTokenFromDocument };
