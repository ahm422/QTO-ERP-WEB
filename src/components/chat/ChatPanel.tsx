"use client";

import { useState, type KeyboardEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { SendHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChatMessageList from "./ChatMessageList";
import { CHAT_MAX_MESSAGE_LENGTH, type ChatMessage } from "./useChat";

const CHARS_WARNING_THRESHOLD = 200;

interface ChatPanelProps {
  messages: ChatMessage[];
  pending: boolean;
  send: (raw: string) => Promise<void>;
}

export default function ChatPanel({ messages, pending, send }: ChatPanelProps) {
  const [draft, setDraft] = useState("");

  const trimmedLength = draft.trim().length;
  const overLimit = draft.length > CHAT_MAX_MESSAGE_LENGTH;
  const canSend = trimmedLength > 0 && !overLimit && !pending;

  const handleSend = () => {
    if (!canSend) return;
    const text = draft;
    setDraft("");
    void send(text);
  };

  const handleStarterClick = (text: string) => {
    void send(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const remaining = CHAT_MAX_MESSAGE_LENGTH - draft.length;
  const showRemaining = draft.length > CHAT_MAX_MESSAGE_LENGTH - CHARS_WARNING_THRESHOLD;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <DialogPrimitive.Title className="text-sm font-semibold text-foreground">
            QTO ERP Assistant
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-xs text-muted-foreground">
            Answers from QTO ERP&apos;s published company information.
          </DialogPrimitive.Description>
        </div>
        <DialogPrimitive.Close asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Close">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogPrimitive.Close>
      </div>

      <ChatMessageList messages={messages} pending={pending} onStarterClick={handleStarterClick} />

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about QTO ERP..."
            rows={1}
            disabled={pending}
            aria-label="Message"
            className="max-h-32 min-h-9 resize-none py-2 text-sm"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
          </Button>
        </div>
        {showRemaining && (
          <p
            className={
              remaining < 0
                ? "mt-1 text-right text-xs text-destructive"
                : "mt-1 text-right text-xs text-muted-foreground"
            }
          >
            {remaining} characters left
          </p>
        )}
      </div>
    </div>
  );
}
