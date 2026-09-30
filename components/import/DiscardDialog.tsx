"use client";

import type { RefObject } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// BONES Discard confirmation, following BONES-shell's Destructive confirmations rule.
export function DiscardDialog({
  open,
  onClose,
  onDiscard,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  onDiscard: () => Promise<void>;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      returnFocus={returnFocus}
      title="Discard this import?"
      body="The draft and its extracted recipe will be deleted."
      confirm="Discard"
      cancel="Keep reviewing"
      onConfirm={onDiscard}
    />
  );
}
