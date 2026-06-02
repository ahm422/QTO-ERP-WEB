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
};

export async function adminFetch<T>(
  url: string,
  options: AdminFetchOptions = {},
): Promise<T> {
  const { json, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

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
