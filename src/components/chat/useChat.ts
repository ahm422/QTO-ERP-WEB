"use client";

import { useCallback, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isError?: boolean;
}

export const CHAT_MAX_MESSAGE_LENGTH = 2000;
const REQUEST_TIMEOUT_MS = 45_000;

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
 * transmitted).
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
          body: JSON.stringify({ message: text }),
          signal: controller.signal,
        });

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
          {
            id: makeId(),
            role: "assistant",
            text: "The assistant is unavailable right now. Please try again.",
            isError: true,
          },
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
