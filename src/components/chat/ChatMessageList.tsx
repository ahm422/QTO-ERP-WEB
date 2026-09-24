"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "./useChat";

const STARTERS = [
  "Which industries does QTO ERP serve?",
  "Which modules does QTO ERP include?",
  "How do I request a demo?",
] as const;

interface ChatMessageListProps {
  messages: ChatMessage[];
  pending: boolean;
  onStarterClick: (text: string) => void;
}

export default function ChatMessageList({ messages, pending, onStarterClick }: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-end gap-4 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Hi! Ask me about QTO ERP&apos;s products, modules, solutions, industries,
            or company information.
          </p>
          <div className="flex flex-col gap-2">
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => onStarterClick(starter)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
        >
          <div
            aria-busy={message.streaming || undefined}
            className={cn(
              "max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm",
              message.role === "user"
                ? "bg-accent text-accent-foreground"
                : message.isError
                  ? "border border-destructive/30 bg-card text-destructive"
                  : "border border-border bg-card text-foreground",
            )}
          >
            {message.text}
          </div>
        </div>
      ))}
      {pending && !messages.some((message) => message.streaming) && (
        <div className="flex justify-start">
          <div
            className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground"
            aria-label="Assistant is typing"
          >
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

export { STARTERS };
