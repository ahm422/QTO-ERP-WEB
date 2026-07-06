/**
 * Phase 13 auth acceptance checks against a running dev server.
 * Usage: npm run verify:auth-flow
 * Optional: AUTH_BASE_URL=http://localhost:8787
 */
const baseUrl = process.env.AUTH_BASE_URL ?? "http://localhost:3000";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  process.exit(1);
}

const jar = new Map<string, string>();

function storeCookies(response: Response): void {
  const getSetCookie = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.bind(response.headers);
  const raw = getSetCookie?.() ?? [];
  for (const part of raw) {
    const [pair] = part.split(";");
    const eq = pair?.indexOf("=");
    if (eq && eq > 0) {
      jar.set(pair!.slice(0, eq).trim(), pair!.slice(eq + 1).trim());
    }
  }
}

function cookieHeader(): string {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function login(): Promise<{ accessToken: string }> {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  storeCookies(response);
  assert(response.ok, `login failed: ${response.status}`);
  const data = (await response.json()) as { accessToken?: string };
  assert(data.accessToken, "login response missing accessToken");
  assert(jar.has("refresh_token"), "login missing refresh_token cookie");
  return { accessToken: data.accessToken };
}

async function main(): Promise<void> {
  console.log(`Verifying auth flow at ${baseUrl}…`);

  const { accessToken } = await login();

  const noBearer = await fetch(`${baseUrl}/api/admin/demo-requests`, {
    headers: { Cookie: cookieHeader() },
  });
  assert(noBearer.status === 401, "admin API without Bearer should return 401");

  const withBearer = await fetch(`${baseUrl}/api/admin/demo-requests`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: cookieHeader(),
    },
  });
  assert(withBearer.ok, `admin API with Bearer failed: ${withBearer.status}`);

  const refresh = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { Cookie: cookieHeader() },
  });
  storeCookies(refresh);
  assert(refresh.ok, `refresh failed: ${refresh.status}`);
  const refreshed = (await refresh.json()) as { accessToken?: string };
  assert(refreshed.accessToken, "refresh missing accessToken");

  const logout = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshed.accessToken}`,
      Cookie: cookieHeader(),
    },
  });
  storeCookies(logout);
  assert(logout.ok, `logout failed: ${logout.status}`);

  const refreshAfterLogout = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { Cookie: cookieHeader() },
  });
  assert(
    refreshAfterLogout.status === 401,
    "refresh after logout should return 401",
  );

  console.log("All auth flow checks passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
