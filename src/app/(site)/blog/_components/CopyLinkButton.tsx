"use client";

import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      icon={Link2}
      iconPosition="left"
      onClick={copy}
    >
      Copy link
    </Button>
  );
}
