/**
 * Demo page CMS + lead submit + email path checks against a running server.
 *
 * Usage: npm run verify:demo
 * Optional: AUTH_BASE_URL=http://localhost:3000 (default)
 *
 * Requires ADMIN_EMAIL / ADMIN_PASSWORD for the admin inbox assertion.
 *
 * Email notes:
 * - POST /api/demo inserts demo_requests then calls sendEmail
 *   (DemoConfirmationEmail + DemoAdminNotificationEmail) via
 *   src/lib/email.ts → Cloudflare Email by default (not Resend unless
 *   EMAIL_PROVIDER=resend).
 * - The route still returns 201 if sendEmail fails (Promise.allSettled).
 * - Under plain `next dev`, the Workers EMAIL binding is usually missing —
 *   treat email delivery as skipped and rely on the lead row + CMS GET.
 * - Under `npm run dev:workers` with EMAIL bound, check worker logs for
 *   `[email] demo` results after this script runs.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

function assertEmailWiring(): void {
  const routePath = join(process.cwd(), "src/app/api/demo/route.ts");
  const emailPath = join(process.cwd(), "src/lib/email.ts");
  const routeSrc = readFileSync(routePath, "utf8");
  const emailSrc = readFileSync(emailPath, "utf8");

  assert(
    routeSrc.includes("DemoConfirmationEmail"),
    "demo route missing DemoConfirmationEmail",
  );
  assert(
    routeSrc.includes("DemoAdminNotificationEmail"),
    "demo route missing DemoAdminNotificationEmail",
  );
  assert(routeSrc.includes("sendEmail"), "demo route missing sendEmail");
  assert(
    !routeSrc.includes("@/lib/resend") && !routeSrc.includes("getResend"),
    "demo route must not call Resend directly",
  );
  assert(
    emailSrc.includes("sendViaCloudflareEmail"),
    "email.ts missing Cloudflare path",
  );
  assert(
    emailSrc.includes('EMAIL_PROVIDER') && emailSrc.includes("resend"),
    "email.ts should only use Resend when EMAIL_PROVIDER=resend",
  );

  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (provider === "resend") {
    console.warn(
      "EMAIL_PROVIDER=resend — Cloudflare Email is not the active provider",
    );
  } else {
    console.log("Email provider: Cloudflare (default)");
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
  return { accessToken: data.accessToken };
}

async function main(): Promise<void> {
  console.log(`Verifying demo flow at ${baseUrl}…`);
  assertEmailWiring();

  const cms = await fetch(`${baseUrl}/api/demo-page`);
  assert(cms.ok, `GET /api/demo-page failed: ${cms.status}`);
  const cmsBody = (await cms.json()) as {
    ok?: boolean;
    page?: { heroTitle?: string; formFieldOptions?: { countries?: string[] } };
  };
  assert(cmsBody.ok === true, "demo-page response missing ok");
  assert(cmsBody.page?.heroTitle, "demo-page missing heroTitle");
  assert(
    Array.isArray(cmsBody.page?.formFieldOptions?.countries) &&
      (cmsBody.page?.formFieldOptions?.countries?.length ?? 0) > 0,
    "demo-page missing countries options",
  );
  console.log("GET /api/demo-page OK");

  const stamp = Date.now();
  const payload = {
    name: `Verify Demo ${stamp}`,
    email: `verify-demo-${stamp}@example.com`,
    phone: "+1 (555) 987-6543",
    country: "United States",
    company: "Verify Co",
    businessType: "startup",
  };

  const submit = await fetch(`${baseUrl}/api/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert(submit.status === 201, `POST /api/demo failed: ${submit.status}`);
  const submitBody = (await submit.json()) as { ok?: boolean; id?: string };
  assert(submitBody.ok === true && submitBody.id, "demo submit missing id");
  console.log(`POST /api/demo OK (id=${submitBody.id})`);
  console.log(
    "Email: sendEmail invoked server-side (ok/fail logged as [email] demo); " +
      "binding may be unavailable under next dev — lead insert is the hard assert",
  );

  const { accessToken } = await login();
  const list = await fetch(`${baseUrl}/api/admin/demo-requests`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: cookieHeader(),
    },
  });
  assert(list.ok, `admin demo-requests failed: ${list.status}`);
  const listBody = (await list.json()) as {
    ok?: boolean;
    requests?: Array<{ id: string; email: string }>;
  };
  const rows = listBody.requests ?? [];
  const found = rows.some(
    (r) => r.id === submitBody.id || r.email === payload.email,
  );
  assert(found, "submitted demo request not found in admin inbox");
  console.log("Admin demo-requests contains lead");

  console.log("All demo flow checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
