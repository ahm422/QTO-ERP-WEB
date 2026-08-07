"use client";

import {
  useCallback,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPanelSwap } from "@/lib/motion";

export type SelectorItem = {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  /** 1-based index for numbered list rows (renders as 01, 02, …). */
  index?: number;
};

export type SelectorPanelProps = {
  items: SelectorItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  renderDetail: (item: SelectorItem) => ReactNode;
  className?: string;
  /** Numbered rows with trailing chevron; default keeps icon+label chrome. */
  listVariant?: "default" | "numbered";
  /** Skip built-in CardHeader so callers own title/badge chrome in renderDetail. */
  hideDetailHeader?: boolean;
  listAriaLabel?: string;
};

function formatIndex(index: number): string {
  return String(index).padStart(2, "0");
}

/**
 * Controlled/uncontrolled two-pane list ↔ detail for module catalog & domain explorer DNA.
 */
export function SelectorPanel({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  renderDetail,
  className,
  listVariant = "default",
  hideDetailHeader = false,
  listAriaLabel = "Select an item",
}: SelectorPanelProps) {
  const listId = useId();
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState(
    () => defaultValue ?? items[0]?.id ?? ""
  );
  const selectedId = isControlled ? valueProp! : uncontrolled;
  const reduced = useReducedMotion();
  const swap = getPanelSwap(reduced);
  const numbered = listVariant === "numbered";

  const selected =
    items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  const select = useCallback(
    (id: string) => {
      if (!isControlled) setUncontrolled(id);
      onValueChange?.(id);
    },
    [isControlled, onValueChange]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!items.length) return;
    const idx = items.findIndex((item) => item.id === selectedId);
    const current = idx < 0 ? 0 : idx;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = items[(current + 1) % items.length];
      select(next.id);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = items[(current - 1 + items.length) % items.length];
      select(prev.id);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(items[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      select(items[items.length - 1].id);
    }
  };

  if (!selected) return null;

  return (
    <div
      className={cn(
        "grid min-w-0 gap-4 md:grid-cols-[minmax(0,14rem)_1fr] lg:grid-cols-[minmax(0,16rem)_1fr]",
        className
      )}
    >
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label={listAriaLabel}
        className="flex w-full min-w-0 max-w-full flex-row gap-2 overflow-x-auto md:flex-col md:overflow-visible"
        onKeyDown={onKeyDown}
      >
        {items.map((item, i) => {
          const isSelected = item.id === selected.id;
          const Icon = item.icon;
          const tabId = `${listId}-tab-${item.id}`;
          const panelId = `${listId}-panel-${item.id}`;
          const displayIndex = item.index ?? i + 1;

          return (
            <button
              key={item.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(item.id)}
              className={cn(
                "flex min-w-[9rem] shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors md:min-w-0",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                isSelected
                  ? "border-border bg-card text-foreground shadow-[var(--card-shadow)]"
                  : "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {numbered ? (
                <span
                  className={cn(
                    "w-7 shrink-0 font-mono text-xs tabular-nums tracking-wide",
                    isSelected ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  {formatIndex(displayIndex)}
                </span>
              ) : Icon ? (
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-muted text-foreground"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.label}</span>
                {!numbered && item.description ? (
                  <span className="mt-0.5 hidden truncate text-xs text-muted-foreground md:block">
                    {item.description}
                  </span>
                ) : null}
              </span>
              {numbered ? (
                <ChevronRight
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0 transition-opacity",
                    isSelected ? "opacity-100 text-foreground" : "opacity-0"
                  )}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <Card
        variant="default"
        radius="lg"
        padding="none"
        className="relative min-h-[12rem] overflow-hidden"
        role="tabpanel"
        id={`${listId}-panel-${selected.id}`}
        aria-labelledby={`${listId}-tab-${selected.id}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected.id}
            variants={swap}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {!hideDetailHeader ? (
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="font-display text-xl">
                  {selected.label}
                </CardTitle>
                {selected.description ? (
                  <CardDescription>{selected.description}</CardDescription>
                ) : null}
              </CardHeader>
            ) : null}
            <CardContent
              className={cn(
                "px-6 py-5",
                hideDetailHeader && "relative min-h-[12rem]"
              )}
            >
              {renderDetail(selected)}
            </CardContent>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
