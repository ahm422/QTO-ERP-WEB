/**
 * Query classification: company-scope + prompt-injection detection.
 *
 * Defense layer 2 (classifier). Pure, deterministic heuristics — no LLM call.
 */

const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all )?(previous|prior|above|earlier|the) (instructions|rules|directives|guidelines|prompts)/i,
  /disregard (all )?(previous|prior|above|earlier|the) (instructions|rules|directives)/i,
  /reveal (your|the) (system prompt|hidden instructions|internal instructions|internal tools|internal configuration|internal database|internal schema)/i,
  /\b(system prompt|hidden instructions|internal config|internal tools|database schema|database structure|database contents|api key|api secret|api token|credentials|secret key)\b/i,
  /;\s*(drop|delete|update|insert|alter|create|attach)\s+/i,
  /union\s+(all\s+)?select\b/i,
  /\bselect\s+\*\s+from\b/i,
  /\bpragma\s+(table_info|foreign_keys|user_version)\b/i,
  /information_schema/i,
  /\bxp_cmdshell\b/i,
  /\bsqlite_(master|stat)\b/i,
  /\b(d1|sqlite)\s+(database|db)\s+(dump|export|download)\b/i,
  /\bload_extension\b/i,
  /\bjailbreak\b/i,
  /you are now (a|an|the) /i,
  /pretend (you are|to be|being) (a|an|the|another)/i,
  /from now on,? (you are|act as|be) /i,
  /forget (everything|all (of )?(your|the)|all previous)/i,
  /new (instructions|rules)?\s*:?\s*(you are|act as)/i,
  /SYSTEM\s*:\s*(you are|instructions)/i,
  /<\s*\/?\s*system\s*>/i,
  /bypass (the |your )?(restrictions|rules|filters|security|guidelines|safeguards)/i,
  /do not (tell|mention|reveal) (your|the) (restrictions|rules|limitations|guidelines)/i,
  // V1 remediation (Phase 3 Step 8): internal-reasoning / hidden-context requests.
  // Narrow phrases only — ordinary words like "context", "document", "reasoning",
  // "source", or "information" must NOT trigger rejection on their own.
  /\bchain[-\s]?of[-\s]?thought\b/i,
  /\breasoning[_\s-]?(content|trace)\b/i,
  /\b(internal|hidden)\s+reasoning\b/i,
  /\b(internal|hidden)\s+context\b/i,
  /\b(hidden|internal|secret)\s+prompt\b/i,
  /\bretrieved\s+(documents?|chunks?|context|passages?)\b/i,
  /\braw\s+retrieved\s+chunks?\b/i,
  /\braw\s+chunks?\b/i,
];

const OUT_OF_SCOPE_PATTERNS: RegExp[] = [
  /\b(write|create|code|build|implement)\s+(a\s+|the\s+)?(python|javascript|typescript|java|rust|golang|go|ruby|php|sql)\s+code/i,
  /\bfunction\s+[a-zA-Z_$][\w$]*\s*\([^)]*\)\s*\{/i,
  /fix (this|my|the|their) (bug|error|code|script|program)/i,
  /\b(deploy|configure|install|setup)\s+(a\s+)?(cloudflare|aws|gcp|azure|nginx|docker|kubernetes|vps|linux|ubuntu|apache|caddy)\b/i,
  /\b(install|setup|configure)\s+(python|node|npm|pip|postgres|redis|nginx)\b/i,
  /\b(what|how)\s+(is|to)\s+(stock|stocks|bitcoin|crypto|cryptocurrency)\b/i,
  /prescribe (me\s+)?(a\s+)?(medicine|drug|dosage)/i,
  /legal advice/i,
  /\b(stock|equity|share|crypto)\s+(recommendation|prediction|forecast|picker)\b/i,
  /\b(write|give me) (a|an|the)? (poem|poetry|joke|song|lyrics|haiku)\b/i,
  // Political / current-news requests. Deliberately narrow so that legitimate
  // company questions mentioning government, public sector, authority, or
  // regulation are NOT rejected (those are valid QTO ERP audiences).
  /\b(politics|political|politician|politicians|partisan)\b/i,
  /\b(election|elections|electoral|ballot|ballots|referendum)\b/i,
  /\b(parliament|congress|senate)\s+(shutdown|scandal|controversy|impeachment|hearing)\b/i,
  /\b(parliament|congress|senate|senator|congressman|congresswoman)\b.{0,40}\b(scandal|controversy|resign|resigned|impeach)/i,
  /\b(latest|today'?s|tonight'?s|breaking|current|world|national|international|global)\s+(news|politics|political|headlines)\b/i,
  /\b(news|headlines)\s+(about|on|regarding)\s+(politics|political|the election|the war)\b/i,
];

// Whole-message greetings / "who are you" questions. Anchored on both ends so a
// greeting followed by a real question ("hi, what modules do you have?") still
// goes through retrieval.
const GREETING_PATTERN = new RegExp(
  "^(?:" +
    [
      "(?:hi+|hello+|hey+|hiya|yo|howdy|greetings|hola|salam|salaam|as+alam+u?\\s*o?\\s*alaikum|aoa)(?:\\s+(?:there|bot|chatbot|assistant|team|all|everyone))?",
      "good\\s+(?:morning|afternoon|evening|day)",
      "how\\s+are\\s+you(?:\\s+doing)?",
      "who\\s+are\\s+you",
      "what\\s+are\\s+you",
      "what\\s+(?:can|do)\\s+you\\s+do",
      "how\\s+can\\s+you\\s+help(?:\\s+me)?",
      "what\\s+can\\s+you\\s+help\\s+(?:me\\s+)?with",
      "introduce\\s+yourself",
      "help",
    ].join("|") +
    ")$",
  "i",
);

export function isGreeting(message: string): boolean {
  const normalized = String(message ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 0 && GREETING_PATTERN.test(normalized);
}

export type Classification = "company" | "out-of-scope" | "injection" | "greeting";

export function classifyMessage(message: string): Classification {
  const m = String(message ?? "");
  for (const re of INJECTION_PATTERNS) {
    if (re.test(m)) return "injection";
  }
  if (isGreeting(m)) return "greeting";
  for (const re of OUT_OF_SCOPE_PATTERNS) {
    if (re.test(m)) return "out-of-scope";
  }
  return "company";
}
