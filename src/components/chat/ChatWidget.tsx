"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFadeInUp } from "@/lib/motion";
import ChatPanel from "./ChatPanel";
import { useChat } from "./useChat";

// Belt-and-suspenders: ChatWidget is only ever mounted from (site)/layout.tsx,
// so /admin/** (which covers /admin/login and /admin/reset-password) and
// /style-guide (a sibling of (site), not inside it) never render this
// component in the first place. This guard protects against future layout
// restructuring accidentally pulling the widget into those trees.
const HIDDEN_PATH_PREFIXES = ["/admin", "/style-guide"];

function isHiddenRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Public marketing chat widget: a bottom-right launcher + a small, contained
 * panel (not a full-page overlay). Mounted only from (site)/layout.tsx.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Owned here (not in ChatPanel) so closing/reopening the panel keeps the
  // thread; a browser refresh remounts ChatWidget and starts a new session.
  const { messages, pending, send } = useChat();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (isHiddenRoute(pathname)) return null;

  const variants = getFadeInUp(reduced);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={open ? "Close QTO ERP assistant" : "Open QTO ERP assistant"}
          aria-expanded={open}
          className={cn(
            "fixed z-[45] flex size-14 items-center justify-center rounded-full",
            "bg-accent text-accent-foreground shadow-[0_4px_20px_color-mix(in_oklab,var(--accent)_45%,transparent)]",
            "transition-transform hover:scale-105 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          )}
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
            right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
          }}
        >
          {open ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <MessageCircle className="size-6" aria-hidden="true" />
          )}
        </button>
      </DialogPrimitive.Trigger>

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Content
              forceMount
              className={cn(
                "fixed z-[45] flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl outline-none",
                "inset-x-3 bottom-3 h-[min(70vh,560px)]",
                "sm:inset-x-auto sm:bottom-[5.5rem] sm:right-4 sm:h-[560px] sm:w-[380px]",
              )}
              style={{
                marginBottom: "env(safe-area-inset-bottom, 0px)",
              }}
              asChild
            >
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={variants}
              >
                <ChatPanel messages={messages} pending={pending} send={send} />
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
