import { getCloudflareContext } from "@opennextjs/cloudflare";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

export type CfSendEmailResult = { ok: true } | { ok: false; error: string };

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
  let emailBinding: SendEmail | undefined;
  try {
    const { env } = await getCloudflareContext({ async: true });
    emailBinding = env.EMAIL;
  } catch (err) {
    console.error("[email] Cloudflare context unavailable:", err);
    return { ok: false, error: "Email service not configured" };
  }

  if (!emailBinding) {
    console.error("[email] EMAIL binding is not configured");
    return { ok: false, error: "Email service not configured" };
  }

  try {
    const html = await render(react);
    const text = await render(react, { plainText: true });
    const response = await emailBinding.send({
      to,
      from: parseEmailFrom(from),
      subject,
      html,
      text,
    });
    console.log("[email] Cloudflare send ok:", response.messageId);
    return { ok: true };
  } catch (err) {
    console.error("[email] Cloudflare send error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
