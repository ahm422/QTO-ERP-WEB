import { COOKIE_CSRF, readCookie } from "@/lib/session-cookies";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export function validateCsrf(request: Request): boolean {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
    return true;
  }

  const cookieToken = readCookie(request, COOKIE_CSRF);
  const headerToken = request.headers.get("X-CSRF-Token");

  if (!cookieToken || !headerToken) {
    return false;
  }

  return cookieToken === headerToken;
}
