import {
  getAccessToken,
  refreshAccessToken,
} from "@/lib/auth-refresh-client";

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

type AdminUploadOptions = Omit<RequestInit, "body" | "credentials"> & {
  _retry?: boolean;
};

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
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

export async function adminFetch<T>(
  url: string,
  options: AdminFetchOptions = {},
): Promise<T> {
  const { json, headers, _retry, method = "GET", ...rest } = options;
  const normalizedMethod = method.toUpperCase();

  const response = await fetch(url, {
    ...rest,
    method: normalizedMethod,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (response.status === 401 && !_retry) {
    const refreshed = (await refreshAccessToken()) !== null;
    if (refreshed) {
      return adminFetch<T>(url, { ...options, _retry: true });
    }
    redirectToLogin();
    throw new AdminFetchError("Unauthorized", 401);
  }

  return parseJsonResponse<T>(response);
}

/** Multipart upload with Bearer auth + one 401→refresh→retry. Do not set Content-Type. */
export async function adminUpload<T>(
  url: string,
  formData: FormData,
  options: AdminUploadOptions = {},
): Promise<T> {
  const { headers, _retry, method = "POST", ...rest } = options;
  const normalizedMethod = method.toUpperCase();

  const response = await fetch(url, {
    ...rest,
    method: normalizedMethod,
    credentials: "include",
    headers: {
      ...authHeaders(),
      ...headers,
    },
    body: formData,
  });

  if (response.status === 401 && !_retry) {
    const refreshed = (await refreshAccessToken()) !== null;
    if (refreshed) {
      return adminUpload<T>(url, formData, { ...options, _retry: true });
    }
    redirectToLogin();
    throw new AdminFetchError("Unauthorized", 401);
  }

  return parseJsonResponse<T>(response);
}
