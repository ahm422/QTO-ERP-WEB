/**
 * Input validation and abuse detection.
 *
 * All guards are pure functions — no side effects, easy to unit-test.
 */

/** Error type for rejected inputs. Carries an HTTP-appropriate reason code. */

export class InputRejectError extends Error {
  readonly reason: string;
  readonly status: 400 | 413 | 429;
  constructor(message: string, reason: string, status: 400 | 413 | 429 = 400) {
    super(message);
    this.name = "InputRejectError";
    this.reason = reason;
    this.status = status;
  }
}

/**
 * Validate a raw chat message.
 * Throws InputRejectError on any violation.
 * Returns the normalized (whitespace-collapsed, trimmed) message.
 */
export function validateChatInput(raw: unknown, maxChars: number): string {
  if (typeof raw !== "string") {
    throw new InputRejectError("message must be a string", "invalid_type");
  }
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (trimmed.length === 0) {
    throw new InputRejectError("message is empty", "empty");
  }
  if (trimmed.length > maxChars) {
    throw new InputRejectError(
      `message exceeds ${maxChars} characters`,
      "too_long",
      413,
    );
  }
  // Repeated-character / null-byte abuse check.
  if (/^(.)\1{200,}$/.test(trimmed)) {
    throw new InputRejectError("excessive repeated characters", "repeated_chars");
  }
  return trimmed;
}
