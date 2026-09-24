/**
 * Streaming generation for POST /chat with `{ stream: true }`.
 *
 * Wire format (NDJSON, one JSON object per line):
 *   {"type":"delta","text":"..."}     append text to the answer
 *   {"type":"replace","text":"..."}   discard what was shown, use this text instead
 *   {"type":"done","sources":[...]}   answer complete
 *   {"type":"error","error":"..."}    generation failed mid-stream
 *
 * The output guard (defense layer 3) still sees every byte before the user
 * does: the last HOLDBACK_CHARS characters are withheld until more text
 * arrives, so a leak pattern is matched before its prefix is emitted. On
 * completion the full answer is guarded + capped exactly like the JSON path;
 * if the result no longer extends what was already shown, a `replace` event
 * swaps it in.
 */
import { UNANSWERED_MESSAGE, type ChatbotConfig } from "../config/index.ts";
import { guardOutput } from "../security/output-guard.ts";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  enforceMaxTokens,
  isUsableAnswer,
  type GenerationSource,
} from "./generator.ts";
import type { Env } from "../types/env.ts";

export const NDJSON_HEADERS = {
  "content-type": "application/x-ndjson; charset=utf-8",
  "cache-control": "no-store",
  "x-accel-buffering": "no",
};

/** Longest leak pattern we need to see whole before emitting its prefix. */
const HOLDBACK_CHARS = 160;

export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "replace"; text: string }
  | { type: "done"; sources: unknown[]; diagnostics?: unknown }
  | { type: "error"; error: string };

export function encodeEvent(event: StreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

/** A complete answer known up front (greeting, out-of-scope, unanswered). */
export function staticAnswerStream(text: string, done: Omit<Extract<StreamEvent, { type: "done" }>, "type"> = { sources: [] }): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encodeEvent({ type: "delta", text }));
      controller.enqueue(encodeEvent({ type: "done", ...done }));
      controller.close();
    },
  });
  return new Response(body, { status: 200, headers: NDJSON_HEADERS });
}

/**
 * Pull text tokens out of one Workers AI SSE `data:` payload. Handles both the
 * legacy `{ response }` shape and the OpenAI-style `choices[].delta.content`
 * shape; `reasoning_content` is deliberately ignored.
 */
export function extractStreamToken(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const data = payload as Record<string, unknown>;
  if (typeof data.response === "string") return data.response;
  const choices = Array.isArray(data.choices) ? (data.choices as unknown[]) : [];
  const first = choices[0] as Record<string, unknown> | undefined;
  const delta = first?.delta as Record<string, unknown> | undefined;
  if (delta && typeof delta.content === "string") return delta.content;
  if (first && typeof first.text === "string") return first.text;
  return "";
}

/** Parse a Workers AI SSE byte stream into text tokens. */
export async function* readAiTokens(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const token = extractStreamToken(JSON.parse(data));
          if (token) yield token;
        } catch {
          // Ignore malformed keep-alive / partial frames.
        }
      }
    }
  } finally {
    reader.releaseLock();
    await stream.cancel().catch(() => {});
  }
}

/** Remove `<think>…</think>` blocks, including an unterminated trailing one. */
export function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?(<\/think>|$)/g, "").replace(/^\s+/, "");
}

/**
 * Incrementally guards generated text. `push` returns the text that is safe
 * to show now; `finish` returns the final event(s) to send.
 */
export class GuardedAnswer {
  private raw = "";
  private emitted = "";
  private blocked = false;

  constructor(private readonly maxChars: number) {}

  /** True once the answer must stop (leak detected or length cap reached). */
  get stopped(): boolean {
    return this.blocked || stripThinking(this.raw).length > this.maxChars;
  }

  push(token: string): string {
    if (this.blocked) return "";
    this.raw += token;
    // The held-back tail also covers a partially received `<think>` tag.
    const visible = stripThinking(this.raw);
    if (guardOutput(visible).replaced) {
      this.blocked = true;
      return "";
    }
    const safeLength = Math.max(0, visible.length - HOLDBACK_CHARS);
    if (safeLength <= this.emitted.length) return "";
    const next = visible.slice(this.emitted.length, safeLength);
    this.emitted += next;
    return next;
  }

  /** Final text after guard + cap, and the event that reconciles it with what was shown. */
  finish(): { text: string; event: StreamEvent | null } {
    const guarded = guardOutput(stripThinking(this.raw));
    let text = isUsableAnswer(guarded.clean)
      ? enforceMaxTokens(guarded.clean, Math.floor(this.maxChars / 4)).text
      : UNANSWERED_MESSAGE;
    if (!isUsableAnswer(text)) text = UNANSWERED_MESSAGE;

    if (text.startsWith(this.emitted)) {
      const rest = text.slice(this.emitted.length);
      this.emitted = text;
      return { text, event: rest ? { type: "delta", text: rest } : null };
    }
    this.emitted = text;
    return { text, event: { type: "replace", text } };
  }
}

/**
 * Run generation with `stream: true` and forward guarded text as NDJSON
 * `delta` events. `onFinish` builds the trailing `done` event from the final
 * answer text (so the handler can drop sources for an unanswered reply).
 */
export async function streamAnswer(
  env: Env,
  question: string,
  sources: GenerationSource[],
  config: ChatbotConfig,
  onFinish: (finalText: string) => Extract<StreamEvent, { type: "done" }>,
): Promise<Response> {
  const ai = env.AI ?? env.ai;
  if (!ai || typeof ai.run !== "function") {
    throw new Error("Workers AI binding is unavailable: run() is missing.");
  }

  // Start generation before opening the response so setup failures still
  // surface as a normal JSON 500 from the handler.
  const aiStream = (await ai.run(config.llmModel, {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(question, sources) },
    ],
    max_tokens: config.maxOutputTokens,
    temperature: 0.2,
    stream: true,
  })) as ReadableStream<Uint8Array>;

  const answer = new GuardedAnswer(Math.max(1, config.maxOutputTokens) * 4);

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const token of readAiTokens(aiStream)) {
          const safe = answer.push(token);
          if (safe) controller.enqueue(encodeEvent({ type: "delta", text: safe }));
          if (answer.stopped) break;
        }
        const { text, event } = answer.finish();
        if (event) controller.enqueue(encodeEvent(event));
        controller.enqueue(encodeEvent(onFinish(text)));
      } catch (error) {
        console.error("chat_stream_error", error instanceof Error ? error.name : "unknown");
        controller.enqueue(encodeEvent({ type: "error", error: "Internal server error" }));
      } finally {
        controller.close();
      }
    },
    cancel() {
      aiStream.cancel().catch(() => {});
    },
  });

  return new Response(body, { status: 200, headers: NDJSON_HEADERS });
}
