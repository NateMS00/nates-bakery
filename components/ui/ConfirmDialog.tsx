"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { cx } from "./cx";

// BONES-shell Destructive confirmations: a header row with the question and a close
// X; one sentence on what will be lost; the destructive action, then the safe action
// as a real button, last, at the bottom (full width on mobile; side by side on
// desktop with the safe action on the right). Focus starts on the safe action.

export function ConfirmActions({
  confirm,
  cancel,
  onConfirm,
  onCancel,
  busy = false,
  className,
  autoFocusCancel = true,
  cancelRef,
}: {
  confirm: string;
  cancel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  className?: string;
  autoFocusCancel?: boolean;
  cancelRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className={cx("flex flex-col gap-sm tablet:flex-row tablet:justify-end", className)}>
      <Button variant="destructive" aria-busy={busy || undefined} onClick={onConfirm} className="w-full tablet:w-auto">
        {confirm}
      </Button>
      <Button ref={cancelRef} variant="secondary" onClick={onCancel} data-autofocus={autoFocusCancel || undefined} className="w-full tablet:w-auto">
        {cancel}
      </Button>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  returnFocus,
  title,
  body,
  confirm,
  cancel,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement | null>;
  title: string;
  body: ReactNode;
  confirm: string;
  cancel: string;
  /** Runs the destructive action; the dialog shows busy and ignores repeat presses meanwhile. */
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title={title} modalColumns={4} returnFocus={returnFocus}>
      <p className="type-body-md text-body">{body}</p>
      <ConfirmActions
        className="mt-lg"
        confirm={confirm}
        cancel={cancel}
        busy={busy}
        onCancel={onClose}
        onConfirm={async () => {
          if (busy) return;
          setBusy(true);
          await onConfirm();
          setBusy(false);
        }}
      />
    </Dialog>
  );
}
