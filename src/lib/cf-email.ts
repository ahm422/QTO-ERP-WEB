import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

export type CfSendEmailResult = { ok: true } | { ok: false; error: string };

/** Account used by wrangler.jsonc / production Worker (Email Sending). */
const DEFAULT_CF_ACCOUNT_ID = "YOUR_CLOUDFLARE_ACCOUNT_ID";

type SendPayload = {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text: string;
};

/** Parse `Name <email@domain>` or a bare address into the Workers binding `from` shape. */
export function parseEmailFrom(
  from: string,
): string | { email: string; name: string } {
  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (!match) {
    return from.trim();
  }

  const name = match[1].replace(/^["']|["']$/g, "").trim();
  const email = match[2].trim();
  return name ? { email, name } : email;
}

/** Named address shape for the Email Sending REST API (`address`, not `email`). */
export function parseEmailFromForRest(from: string): {
  address: string;
  name?: string;
} {
  const parsed = parseEmailFrom(from);
  if (typeof parsed === "string") {
    return { address: parsed };
  }
  return { address: parsed.email, name: parsed.name };
}

function getCfAccountId(): string {
  return (
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ||
    process.env.CF_ACCOUNT_ID?.trim() ||
    DEFAULT_CF_ACCOUNT_ID
  );
}

function getCfApiToken(): string | null {
  const token =
    process.env.CLOUDFLARE_API_TOKEN?.trim() ||
    process.env.CF_API_TOKEN?.trim() ||
    "";
  return token || null;
}

function isLocalNodeRuntime(): boolean {
  // Workers have no child_process / wrangler CLI; local next does.
  return (
    process.env.NEXTJS_ENV === "development" ||
    process.env.NODE_ENV !== "production"
  );
}

/**
 * Cloudflare Email Sending REST API — used when the Worker `EMAIL` binding is
 * unavailable (plain `npm run dev`). Same Email Service as `env.EMAIL.send()`.
 * Docs: https://developers.cloudflare.com/email-service/api/send-emails/rest-api/
 */
async function sendViaCloudflareRest(
  payload: SendPayload,
): Promise<CfSendEmailResult | null> {
  const token = getCfApiToken();
  if (!token) {
    return null;
  }

  const accountId = getCfAccountId();
  const fromParsed = parseEmailFromForRest(payload.from);
  // REST schema matches wrangler CLI: bare string, or { address, name }.
  const body = {
    to: payload.to,
    from: fromParsed.name
      ? { address: fromParsed.address, name: fromParsed.name }
      : fromParsed.address,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  };

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const json = (await res.json()) as {
      success?: boolean;
      errors?: { code?: number; message?: string }[];
      result?: { delivered?: string[]; queued?: string[] };
    };

    if (!res.ok || !json.success) {
      const message =
        json.errors?.map((e) => e.message).filter(Boolean).join("; ") ||
        `Cloudflare Email REST ${res.status}`;
      console.error("[email] Cloudflare REST send error:", message, json);
      return { ok: false, error: message };
    }

    console.log(
      "[email] Cloudflare REST send ok:",
      json.result?.delivered ?? json.result?.queued ?? "queued",
    );
    return { ok: true };
  } catch (err) {
    console.error("[email] Cloudflare REST unexpected error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

/**
 * Local-only fallback: `wrangler email sending send` using the developer's
 * existing `wrangler login` OAuth (same Cloudflare Email Sending service).
 * Avoids needing CLOUDFLARE_API_TOKEN when remote EMAIL binding can't run
 * (no IPv6 ::1 under plain next).
 */
async function sendViaWranglerCli(
  payload: SendPayload,
): Promise<CfSendEmailResult> {
  if (!isLocalNodeRuntime()) {
    return { ok: false, error: "Email service not configured" };
  }

  const fromParsed = parseEmailFromForRest(payload.from);
  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const dir = await mkdtemp(join(tmpdir(), "qto-email-"));
  const htmlPath = join(dir, "body.html");
  const textPath = join(dir, "body.txt");
  const outPath = join(dir, "wrangler.out");

  try {
    await writeFile(htmlPath, payload.html, "utf8");
    await writeFile(textPath, payload.text, "utf8");
    const html = await readFile(htmlPath, "utf8");
    const text = await readFile(textPath, "utf8");

    const args = [
      "wrangler",
      "email",
      "sending",
      "send",
      "-c",
      "wrangler.jsonc",
      "--from",
      fromParsed.address,
      "--subject",
      payload.subject,
      "--html",
      html,
      "--text",
      text,
      ...recipients.flatMap((addr) => ["--to", addr]),
    ];
    if (fromParsed.name) {
      args.push("--from-name", fromParsed.name);
    }

    const result = await new Promise<{
      code: number | null;
      stdout: string;
      stderr: string;
    }>((resolve) => {
      const child = spawn("npx", args, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: getCfAccountId(),
          WRANGLER_LOG: process.env.WRANGLER_LOG ?? "error",
        },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on("close", (code) => resolve({ code, stdout, stderr }));
      child.on("error", (err) =>
        resolve({ code: 1, stdout: "", stderr: err.message }),
      );
    });

    await writeFile(
      outPath,
      `${result.stdout}\n${result.stderr}`.slice(0, 8000),
      "utf8",
    );

    if (result.code !== 0) {
      const message =
        result.stderr.trim() ||
        result.stdout.trim() ||
        `wrangler email sending exited ${result.code}`;
      console.error("[email] wrangler CLI send failed:", message);
      return { ok: false, error: message };
    }

    console.log("[email] Cloudflare wrangler CLI send ok");
    return { ok: true };
  } catch (err) {
    console.error("[email] wrangler CLI unexpected error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function sendViaCloudflareBinding(
  payload: SendPayload,
): Promise<CfSendEmailResult | null> {
  let emailBinding: SendEmail | undefined;
  try {
    const { env } = await getCloudflareContext({ async: true });
    emailBinding = env.EMAIL;
  } catch (err) {
    console.warn("[email] Cloudflare context unavailable:", err);
    return null;
  }

  if (!emailBinding) {
    console.warn("[email] EMAIL binding is not configured");
    return null;
  }

  try {
    const response = await emailBinding.send({
      to: payload.to,
      from: parseEmailFrom(payload.from),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    console.log("[email] Cloudflare binding send ok:", response.messageId);
    return { ok: true };
  } catch (err) {
    console.error("[email] Cloudflare binding send error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

/**
 * Send via Cloudflare Email Service only (never Resend).
 * 1) Worker binding `env.EMAIL` when available
 * 2) Email Sending REST API when `CLOUDFLARE_API_TOKEN` is set
 * 3) Local `wrangler email sending send` (existing `wrangler login`) under next dev
 */
export async function sendViaCloudflareEmail({
  to,
  from,
  subject,
  react,
}: {
  to: string | string[];
  from: string;
  subject: string;
  react: ReactElement;
}): Promise<CfSendEmailResult> {
  const html = await render(react);
  const text = await render(react, { plainText: true });
  const payload: SendPayload = { to, from, subject, html, text };

  const bindingResult = await sendViaCloudflareBinding(payload);
  if (bindingResult) {
    return bindingResult;
  }

  const restResult = await sendViaCloudflareRest(payload);
  if (restResult) {
    return restResult;
  }

  console.warn(
    "[email] No EMAIL binding / CLOUDFLARE_API_TOKEN; trying wrangler CLI (local Cloudflare Email)",
  );
  return sendViaWranglerCli(payload);
}
