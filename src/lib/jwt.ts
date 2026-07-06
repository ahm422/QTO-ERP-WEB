import { SignJWT, jwtVerify } from "jose";
import { roles, type Role } from "@/db/enums";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS };

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export function getRefreshPepper(): string {
  const pepper = process.env.JWT_REFRESH_PEPPER?.trim();
  if (!pepper) {
    throw new Error("JWT_REFRESH_PEPPER is not configured");
  }
  return pepper;
}

export async function signAccessToken(payload: {
  sub: string;
  role: Role;
}): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<{ sub: string; role: Role } | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    const sub = payload.sub;
    const role = payload.role;
    if (
      typeof sub !== "string" ||
      typeof role !== "string" ||
      !roles.includes(role as Role)
    ) {
      return null;
    }
    return { sub, role: role as Role };
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const randomPart = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${crypto.randomUUID()}.${randomPart}`;
}

export async function hashRefreshToken(raw: string): Promise<string> {
  const pepper = getRefreshPepper();
  const data = new TextEncoder().encode(raw + pepper);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
