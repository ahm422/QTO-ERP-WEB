/**
 * Phase 3 users / invite / password-reset acceptance checks.
 * Usage: npm run verify:users-flow
 * Optional: AUTH_BASE_URL=http://localhost:3000
 *
 * Seeds a temporary Super Admin into local D1 (does not require ADMIN_EMAIL).
 * Requires a running Next/Workers dev server sharing `.wrangler/state`.
 */
import { execFileSync } from "node:child_process";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";
import { generateRefreshToken, hashRefreshToken } from "../src/lib/jwt";

const baseUrl = process.env.AUTH_BASE_URL ?? "http://localhost:3000";

const jar = new Map<string, string>();
const suffix = Date.now().toString(36);
const superEmail = `super-${suffix}@example.com`;
const superPassword = "super-admin-pass-12";
const editorEmail = `editor-${suffix}@example.com`;
const inviteEmail = `invite-${suffix}@example.com`;
const resetUserEmail = `reset-${suffix}@example.com`;
const editorPassword = "editor-password-12";
const resetUserPassword = "reset-user-pass-12";
const newResetPassword = "brand-new-pass-12";

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function d1Execute(sql: string): void {
  execFileSync(
    "npx",
    [
      "wrangler",
      "d1",
      "execute",
      "qto-erp-db-production",
      "--local",
      "--command",
      sql,
    ],
    { stdio: "pipe", cwd: process.cwd(), encoding: "utf8" },
  );
}

function storeCookies(response: Response): void {
  const getSetCookie = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.bind(response.headers);
  const raw = getSetCookie?.() ?? [];
  for (const part of raw) {
    const [pair] = part.split(";");
    const eqIdx = pair?.indexOf("=");
    if (eqIdx && eqIdx > 0) {
      jar.set(pair!.slice(0, eqIdx).trim(), pair!.slice(eqIdx + 1).trim());
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

function assertNoSecrets(payload: unknown): void {
  const text = JSON.stringify(payload);
  assert(!/"passwordHash"/i.test(text), "response leaked passwordHash");
  assert(!/"password"/i.test(text), "response leaked password field");
  assert(!/"tokenHash"/i.test(text), "response leaked tokenHash");
}

async function login(
  email: string,
  password: string,
): Promise<{ accessToken: string; status: number }> {
  jar.clear();
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  storeCookies(response);
  const data = (await response.json().catch(() => ({}))) as {
    accessToken?: string;
  };
  return { accessToken: data.accessToken ?? "", status: response.status };
}

async function seedLocalUser(opts: {
  email: string;
  password: string;
  role: "ADMIN" | "EDITOR" | "SUPER_ADMIN";
  name?: string;
}): Promise<string> {
  const id = createId();
  const passwordHash = await bcrypt.hash(opts.password, 12);
  const now = Math.floor(Date.now() / 1000);
  const name = opts.name ? `'${escapeSql(opts.name)}'` : "NULL";
  d1Execute(
    `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES ('${id}', '${escapeSql(opts.email)}', '${escapeSql(passwordHash)}', ${name}, '${opts.role}', ${now}, ${now});`,
  );
  return id;
}

async function insertResetToken(userId: string): Promise<string> {
  const raw = generateRefreshToken();
  const tokenHash = await hashRefreshToken(raw);
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 60 * 60;
  const id = createId();
  d1Execute(
    `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at)
VALUES ('${id}', '${escapeSql(userId)}', '${escapeSql(tokenHash)}', ${expires}, NULL, ${now});`,
  );
  return raw;
}

function cleanupEmails(emails: string[]): void {
  for (const email of emails) {
    d1Execute(`DELETE FROM users WHERE email = '${escapeSql(email)}';`);
  }
}

async function main(): Promise<void> {
  console.log(`Verifying users flow at ${baseUrl}…`);

  const emailsToClean = [
    superEmail,
    editorEmail,
    inviteEmail,
    resetUserEmail,
  ];

  try {
    await seedLocalUser({
      email: superEmail,
      password: superPassword,
      role: "SUPER_ADMIN",
      name: "Verify Super",
    });

    const superLogin = await login(superEmail, superPassword);
    assert(
      superLogin.status === 200,
      `super admin login failed: ${superLogin.status}`,
    );
    assert(superLogin.accessToken, "missing accessToken");
    const superToken = superLogin.accessToken;

    const listRes = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${superToken}` },
    });
    assert(listRes.status === 200, `GET users failed: ${listRes.status}`);
    const listData = await listRes.json();
    assertNoSecrets(listData);

    const inviteRes = await fetch(`${baseUrl}/api/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${superToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inviteEmail,
        name: "Invite Test",
        role: "EDITOR",
      }),
    });
    const inviteBody = await inviteRes.json();
    assertNoSecrets(inviteBody);
    if (inviteRes.status === 201) {
      console.log("  invite API returned 201 (email delivered)");
    } else {
      assert(
        inviteRes.status === 502 || inviteRes.status === 500,
        `unexpected invite status: ${inviteRes.status}`,
      );
      console.log(
        `  invite API returned ${inviteRes.status} (email unavailable — fail-closed OK)`,
      );
    }

    const resetUserId = await seedLocalUser({
      email: resetUserEmail,
      password: resetUserPassword,
      role: "ADMIN",
      name: "Reset Test",
    });

    await seedLocalUser({
      email: editorEmail,
      password: editorPassword,
      role: "EDITOR",
      name: "Editor Test",
    });

    const editorLogin = await login(editorEmail, editorPassword);
    assert(editorLogin.status === 200, "editor login failed");
    const forbidden = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${editorLogin.accessToken}` },
    });
    assert(
      forbidden.status === 403,
      `EDITOR should get 403, got ${forbidden.status}`,
    );

    const forgotUnknown = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `nobody-${suffix}@example.com` }),
    });
    assert(forgotUnknown.status === 200, "forgot unknown should be 200");
    const forgotUnknownBody = (await forgotUnknown.json()) as {
      message?: string;
    };
    assert(forgotUnknownBody.message, "forgot should return generic message");

    const forgotKnown = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetUserEmail }),
    });
    assert(forgotKnown.status === 200, "forgot known should be 200");

    const rawToken = await insertResetToken(resetUserId);
    assert(rawToken.includes("."), "raw token should be uuid.random format");
    assert(
      !(await hashRefreshToken(rawToken)).includes("."),
      "hash must not look like raw token",
    );

    const beforeReset = await login(resetUserEmail, resetUserPassword);
    assert(beforeReset.status === 200, "pre-reset login failed");
    const oldRefreshCookie = cookieHeader();

    const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken, password: newResetPassword }),
    });
    assert(resetRes.status === 200, `reset failed: ${resetRes.status}`);

    const refreshAfterReset = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: oldRefreshCookie },
    });
    assert(
      refreshAfterReset.status === 401,
      "old refresh cookie should be rejected after reset",
    );

    const reuse = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken, password: newResetPassword }),
    });
    assert(reuse.status === 400, "reused token should be 400");

    const oldPasswordLogin = await login(resetUserEmail, resetUserPassword);
    assert(oldPasswordLogin.status === 401, "old password should fail");

    const newPasswordLogin = await login(resetUserEmail, newResetPassword);
    assert(newPasswordLogin.status === 200, "new password login failed");

    const superAgain = await login(superEmail, superPassword);
    assert(superAgain.status === 200, "super admin re-login failed");

    const disableRes = await fetch(
      `${baseUrl}/api/admin/users/${resetUserId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${superAgain.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disabled: true }),
      },
    );
    assert(disableRes.status === 200, `disable failed: ${disableRes.status}`);

    const disabledLogin = await login(resetUserEmail, newResetPassword);
    assert(disabledLogin.status === 401, "disabled user must not login");

    console.log("All users flow checks passed.");
  } finally {
    try {
      cleanupEmails(emailsToClean);
    } catch (err) {
      console.warn("cleanup warning:", err);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
