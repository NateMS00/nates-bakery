"use client";

import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

// BONES Discard confirmation: "Discard this import?", what happens, Discard
// (destructive), Keep reviewing. Focus starts on Keep reviewing and returns to Discard.

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
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="Discard this import?" modalColumns={4} returnFocus={returnFocus}>
      <p className="type-body-md text-body">The draft and its extracted recipe will be deleted.</p>
      <div className="mt-lg flex flex-col-reverse gap-sm tablet:flex-row tablet:items-center">
        <Button
          variant="destructive"
          aria-busy={busy || undefined}
          onClick={async () => {
            if (busy) return;
            setBusy(true);
            await onDiscard();
          }}
        >
          Discard
        </Button>
        <Button variant="text" onClick={onClose} data-autofocus>
          Keep reviewing
        </Button>
      </div>
    </Dialog>
  );
}
