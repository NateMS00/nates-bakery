"use client";

import { Copy } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { InlineConfirmation } from "@/components/ui/InlineConfirmation";
import type { ShareLink } from "@/lib/data/types";

// BONES Share dialog: mobile bottom sheet, desktop modal 5 cols, both sized to
// their content with a close X in the header row. Title, read-only link with Copy, the privacy note, Revoke link (confirmed
// inside the dialog). With no link yet, "Create link" replaces the field.

export function ShareDialog({
  open,
  onClose,
  shareLink,
  onCreate,
  onRevoke,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  shareLink: ShareLink | null;
  onCreate: () => void;
  onRevoke: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  // Buttons that swap out move focus to their replacement, so it isn't lost.
  const copyButton = useRef<HTMLButtonElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const keepButton = useRef<HTMLButtonElement>(null);
  const revokeButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"copy" | "create" | "keep" | "revoke" | null>(null);

  useEffect(() => {
    const target = { copy: copyButton, create: createButton, keep: keepButton, revoke: revokeButton }[pendingFocus.current ?? "copy"];
    if (pendingFocus.current) target.current?.focus();
    pendingFocus.current = null;
  }, [shareLink, confirmRevoke]);
  const url = shareLink ? `${typeof window === "undefined" ? "" : window.location.origin}/r/${shareLink.token}` : "";

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 10_000);
    return () => window.clearTimeout(t);
  }, [copied]);

  function close() {
    setCopied(false);
    setConfirmRevoke(false);
    onClose();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      field.current?.select();
      document.execCommand("copy");
    }
    setCopied(true);
  }

  return (
    <Dialog open={open} onClose={close} title="Share recipe" modalColumns={5} returnFocus={returnFocus}>
      <div className="mt-sm flex flex-col gap-base">
        {shareLink ? (
          <>
            <div className="flex flex-col gap-xs">
              <label htmlFor="share-link" className="type-label text-muted">
                Share link
              </label>
              <div className="flex gap-sm">
                <input
                  ref={field}
                  id="share-link"
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-h-control-height min-w-0 flex-1 truncate rounded-md border border-border bg-surface-card px-base type-body-md text-ink hover:border-ink focus-visible:border-primary focus-visible:outline-offset-1"
                />
                <Button ref={copyButton} variant="secondary" onClick={copy} data-autofocus>
                  <Copy aria-hidden="true" />
                  Copy
                </Button>
              </div>
            </div>
            {copied && <InlineConfirmation>Link copied</InlineConfirmation>}
          </>
        ) : (
          <Button
            ref={createButton}
            variant="primary"
            onClick={() => {
              pendingFocus.current = "copy";
              onCreate();
            }}
            data-autofocus
            className="self-start"
          >
            Create link
          </Button>
        )}

        <p className="type-body-sm text-body">Friends can read and scale it. Your bake log stays private.</p>

        {shareLink && !confirmRevoke && (
          <Button
            ref={revokeButton}
            variant="text"
            onClick={() => {
              pendingFocus.current = "keep";
              setConfirmRevoke(true);
            }}
            className="-ml-sm self-start"
          >
            Revoke link
          </Button>
        )}
        {shareLink && confirmRevoke && (
          <div role="group" aria-labelledby="revoke-question" className="rounded-md border-l-4 border-error bg-error-wash px-base py-md">
            <p id="revoke-question" className="type-body-sm text-ink">
              Revoke this link? Anyone who opens it will see that it no longer works. Sharing again creates a new link.
            </p>
            <div className="mt-md flex flex-wrap items-center gap-sm">
              <Button
                variant="destructive"
                onClick={() => {
                  pendingFocus.current = "create";
                  onRevoke();
                  setConfirmRevoke(false);
                  setCopied(false);
                }}
              >
                Revoke link
              </Button>
              <Button
                ref={keepButton}
                variant="text"
                onClick={() => {
                  pendingFocus.current = "revoke";
                  setConfirmRevoke(false);
                }}
              >
                Keep link
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
