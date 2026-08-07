"use client";

import type { ReactNode } from "react";
import {
  SelectorPanel,
  type SelectorItem,
  type SelectorPanelProps,
} from "@/components/ui/selector-panel";
import { cn } from "@/lib/utils";

export type EcosystemTabItem = SelectorItem;

export type EcosystemTabsProps = {
  items: EcosystemTabItem[];
  renderDetail: (item: EcosystemTabItem) => ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
  hideDetailHeader?: boolean;
  listAriaLabel?: string;
};

/**
 * “Connected Ecosystem” explorer — thin wrapper over SelectorPanel (numbered list + detail card).
 * Do not reinvent tabs; compose SelectorPanel.
 */
export function EcosystemTabs({
  items,
  renderDetail,
  value,
  defaultValue,
  onValueChange,
  className,
  hideDetailHeader = true,
  listAriaLabel = "Select an ecosystem module",
}: EcosystemTabsProps) {
  const panelProps: SelectorPanelProps = {
    items,
    renderDetail,
    value,
    defaultValue,
    onValueChange,
    listVariant: "numbered",
    hideDetailHeader,
    listAriaLabel,
    className: cn(
      "md:grid-cols-[minmax(0,18rem)_1fr] lg:grid-cols-[minmax(0,20rem)_1fr]",
      className
    ),
  };

  return <SelectorPanel {...panelProps} />;
}
