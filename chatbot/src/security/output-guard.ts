/**
 * Output guard: scrub LLM responses before returning them to the user.
 *
 * Defense layer 3. The model is instructed (layer 1) and the query is
 * pre-classified (layer 2); this layer catches leakage that slips through.
 *
 * Scans the LLM's raw output for signs of leaked secrets, system prompt,
 * internal infrastructure, or database schema, and either redacts the
 * offending span or replaces the whole response with a safe message.
 */

export interface OutputGuardResult {
  clean: string;
  wasFlagged: boolean;
  /** True when the entire response was replaced with a safe fallback. */
  replaced: boolean;
}

export const SAFE_FALLBACK =
  "I couldn't provide that detail from QTO ERP's available company information.";

// Patterns that, if present in output, indicate a leak we must remove entirely.
const LEAK_PATTERNS: RegExp[] = [
  // System prompt / instructions
  /you are the official (qto\s*)?erp (company )?(information|knowledge|support) assistant/i,
  /trusted company knowledge/i,
  /answer using (only )?(the )?trusted company knowledge/i,
  /\bsystem prompt\b/i,
  /\bhidden instructions?\b/i,
  /internal (tools|configuration|implementation|prompts)/i,
  // Credentials / secrets (common key + token-looking values)
  /\b(api[_\s-]?key|api[_\s-]?secret|secret[_\s-]?key|access[_\s-]?token|refresh[_\s-]?token|client[_\s-]?secret|authorization)\s*[:=]\s*\S+/i,
  /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/i,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /\bwhsec_[A-Za-z0-9]{16,}\b/,
  /\beyJ[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}/, // JWT-ish
  /(?:sk|pk)_live_[A-Za-z0-9]{10,}/, // Stripe live keys
  /sk_live_[A-Za-z0-9]{10,}/,
  // Database / infra exposure
  /\b(qto-erp-db[-\w]*)\b(?=.{0,40}(database|d1|sqlite))/i,
  /vectorize (namespace|index) (named|called|:) /i,
  /\bwrangler\b/i,
  /\bworkerd\b/i,
  /\bcloudflare (account|zone|binding)\b/i,
  /database id(entifier)?\s*[:=]\s*[0-9a-f-]{16,}/i,
  // Raw SQL / schema introspection
  /\bselect\s+\*\s+from\b/i,
  /\bpragma\s+table_info\b/i,
  /\binformation_schema\b/i,
  /\bcreate\s+table\b/i,
  /\bdrop\s+table\b/i,
];

/**
 * Scrub an LLM response. Returns the cleaned text plus flags.
 *
 * - If a high-confidence leak pattern matches, the WHOLE response is
 *   replaced with a safe fallback (we don't try to selectively scrub
 *   model prose).
 */
export function guardOutput(raw: string): OutputGuardResult {
  const text = String(raw ?? "").trim();
  if (text.length === 0) {
    return { clean: text, wasFlagged: false, replaced: false };
  }
  if (LEAK_PATTERNS.some((re) => re.test(text))) {
    return { clean: SAFE_FALLBACK, wasFlagged: true, replaced: true };
  }
  return { clean: text, wasFlagged: false, replaced: false };
}
