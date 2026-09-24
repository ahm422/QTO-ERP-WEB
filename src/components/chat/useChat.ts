"use client";

import { useCallback, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
  /** True while the answer is still arriving. */
  streaming?: boolean;
}

export const CHAT_MAX_MESSAGE_LENGTH = 2000;
const REQUEST_TIMEOUT_MS = 45_000;
/** Max silence between streamed chunks before giving up. */
const STREAM_IDLE_TIMEOUT_MS = 30_000;
const UNAVAILABLE_COPY = "The assistant is unavailable right now. Please try again.";

type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "replace"; text: string }
  | { type: "done" }
  | { type: "error"; error?: string };

function parseStreamLine(line: string): StreamEvent | null {
  try {
    const event = JSON.parse(line) as Partial<StreamEvent> | null;
    if (!event || typeof event !== "object") return null;
    if ((event.type === "delta" || event.type === "replace") && typeof event.text === "string") {
      return event as StreamEvent;
    }
    if (event.type === "done" || event.type === "error") return event as StreamEvent;
  } catch {
    // Ignore malformed lines.
  }
  return null;
}

/**
 * Read the NDJSON answer stream from /api/chat, calling `onText` with the full
 * answer so far. Resolves with the final text, or throws on an error event,
 * idle timeout, or a stream that ends without any answer.
 */
async function readAnswerStream(
  body: ReadableStream<Uint8Array>,
  controller: AbortController,
  onText: (text: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let finished = false;
  let idle = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);

  const handle = (line: string) => {
    const event = parseStreamLine(line);
    if (!event) return;
    if (event.type === "delta") answer += event.text;
    else if (event.type === "replace") answer = event.text;
    else if (event.type === "done") finished = true;
    else throw new Error("stream_error");
    onText(answer);
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      clearTimeout(idle);
      idle = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);
      buffer += decoder.decode(value, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line) handle(line);
      }
    }
    const tail = (buffer + decoder.decode()).trim();
    if (tail) handle(tail);
  } finally {
    clearTimeout(idle);
    reader.releaseLock();
  }

  if (!finished && !answer.trim()) throw new Error("stream_incomplete");
  return answer;
}

function makeId(): string {
  return Math.random().toString(36).slice(2);
}

function errorCopyFor(status: number, retryAfter: string | null): string {
  switch (status) {
    case 400:
      return "That message couldn't be sent. Try rephrasing your question.";
    case 413:
      return "Messages can be at most 2000 characters.";
    case 429: {
      const seconds = retryAfter ? Number(retryAfter) : NaN;
      return Number.isFinite(seconds) && seconds > 0
        ? `Too many questions right now. Try again in ${seconds} seconds.`
        : "Too many questions right now. Try again in a minute.";
    }
    case 500:
      return "Something went wrong. Please try again.";
    default:
      // 502 / 503 / 504 / anything else
      return "The assistant is unavailable right now. Please try again.";
  }
}

/**
 * Client state for the chat widget. Talks only to same-origin POST /api/chat
 * (never the chatbot Worker). Local in-memory transcript only — no
 * localStorage, no server persistence. The hook is owned by `ChatWidget`, so
 * closing/reopening the panel keeps the current thread, while a browser refresh
 * starts a new one. Each turn is sent independently (no client-side history is
 * transmitted). Answers are streamed (NDJSON) and rendered as they arrive.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || text.length > CHAT_MAX_MESSAGE_LENGTH || pending) return;

      setMessages((prev) => [...prev, { id: makeId(), role: "user", text }]);
      setPending(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text, stream: true }),
          signal: controller.signal,
        });

        if (
          response.ok &&
          response.body &&
          (response.headers.get("content-type") ?? "").includes("application/x-ndjson")
        ) {
          // Headers arrived — from here the idle timeout in readAnswerStream applies.
          clearTimeout(timeout);
          const id = makeId();
          let shown = false;
          const show = (answer: string, extra: Partial<ChatMessage> = {}) => {
            if (!shown) {
              if (!answer) return;
              shown = true;
              setMessages((prev) => [
                ...prev,
                { id, role: "assistant", text: answer, streaming: true, ...extra },
              ]);
              return;
            }
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, text: answer, ...extra } : m)),
            );
          };

          try {
            const answer = await readAnswerStream(response.body, controller, (partial) =>
              show(partial),
            );
            show(answer, { streaming: false });
          } catch {
            // Keep any partial answer that arrived, then flag the failure.
            setMessages((prev) => [
              ...prev.map((m) => (m.id === id ? { ...m, streaming: false } : m)),
              { id: makeId(), role: "assistant", text: UNAVAILABLE_COPY, isError: true },
            ]);
          }
          return;
        }

        let data: unknown = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        const answer =
          data && typeof data === "object" && "answer" in data
            ? (data as { answer?: unknown }).answer
            : undefined;

        if (response.ok && typeof answer === "string") {
          setMessages((prev) => [...prev, { id: makeId(), role: "assistant", text: answer }]);
        } else {
          const copy = errorCopyFor(response.status, response.headers.get("retry-after"));
          setMessages((prev) => [
            ...prev,
            { id: makeId(), role: "assistant", text: copy, isError: true },
          ]);
        }
      } catch {
        // Network failure or our own ~45s abort — same generic copy as a 502/503/504.
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: "assistant", text: UNAVAILABLE_COPY, isError: true },
        ]);
      } finally {
        clearTimeout(timeout);
        abortRef.current = null;
        setPending(false);
      }
    },
    [pending],
  );

  return { messages, pending, send };
}
