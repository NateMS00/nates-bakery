"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { InlineConfirmation } from "@/components/ui/InlineConfirmation";
import { cx } from "@/components/ui/cx";
import { discardDraftOptimistic, undoDiscard, usePendingDiscard } from "@/lib/data/store";
import type { Draft } from "@/lib/data/types";

// BONES-recipes.md 1.5.0 Drafts view (a tab panel, not a section above Recipes
// anymore): all drafts show, newest first, no cap — the view exists for them, so
// there's no "Show all". Importing rows aren't links yet; they turn into Ready to
// review or Couldn't finish without a reload, announced politely. Every row ends
// with Discard: removes the row at once, "Draft discarded" with Undo for 10
// seconds, no confirmation dialog. SKIN draft-row.

export function DraftsSection({
  drafts,
  initiallyImporting,
  onLastDiscarded,
}: {
  drafts: Draft[];
  initiallyImporting: Set<string>;
  /** The Drafts tab hides once this view's last draft is gone (BONES); focus goes to the Recipes tab. */
  onLastDiscarded: () => void;
}) {
  const list = useRef<HTMLUListElement>(null);
  const finished = drafts.filter((d) => initiallyImporting.has(d.id) && (d.status === "ready" || d.status === "failed"));
  const pendingDiscard = usePendingDiscard();

  function discard(draft: Draft, index: number) {
    discardDraftOptimistic(draft.id);
    if (drafts.length === 1) {
      onLastDiscarded();
      return;
    }
    // The row at this index is now the one that follows the discarded row (everything shifted up).
    requestAnimationFrame(() => list.current?.children[index]?.querySelector<HTMLElement>("a, button")?.focus());
  }

  return (
    <section aria-labelledby="drafts-heading">
      <h2 id="drafts-heading" className="sr-only">
        Drafts
      </h2>
      <ul ref={list} role="list" className="mt-sm flex flex-col gap-sm">
        {drafts.map((draft, i) => (
          <li key={draft.id}>
            <DraftRow draft={draft} onDiscard={() => discard(draft, i)} />
          </li>
        ))}
      </ul>
      {pendingDiscard && (
        <InlineConfirmation className="mt-sm">
          <span>
            Draft discarded <span aria-hidden="true">·</span>
          </span>
          <Button variant="text" onClick={() => undoDiscard(pendingDiscard)} className="-my-md -ml-sm">
            Undo
          </Button>
        </InlineConfirmation>
      )}
      <p role="status" className="sr-only">
        {finished.map((d) => (d.status === "failed" ? `${draftTitle(d)} couldn't finish importing.` : `${draftTitle(d)} is ready to review.`)).join(" ")}
      </p>
    </section>
  );
}

const draftTitle = (d: Draft) => d.title ?? `@${d.creatorHandle}'s reel`;

function DraftRow({ draft, onDiscard }: { draft: Draft; onDiscard: () => void }) {
  const linked = draft.status === "ready" || draft.status === "failed";
  const status = draft.status === "ready" ? "Ready to review" : draft.status === "failed" ? "Couldn't finish" : "Importing…";
  const title = draftTitle(draft);
  // Mobile: title, then "@creator · status". Tablet up: title | creator | status,
  // the meta spans joining the row's grid. Padding lives here, not on the row's outer
  // div, so the Link's own box (what a touch target is measured on) stays ≥48px tall.
  const innerClass = "grid min-w-0 px-base py-md tablet:grid-cols-[minmax(0,1fr)_minmax(0,calc(var(--col)*2))_auto] tablet:items-center tablet:gap-x-lg";
  const content = (
    <>
      <span className={cx("truncate type-body-md", linked ? "text-ink" : "text-muted")}>{title}</span>
      <span className="type-caption text-muted tablet:contents">
        <span className="tablet:truncate">@{draft.creatorHandle}</span>
        <span aria-hidden="true" className="tablet:hidden">
          {" · "}
        </span>
        {/* The dot is visual only; screen readers get a comma, so the handle and status don't run together. */}
        <span className="sr-only">, </span>
        <span className="tablet:text-right">{status}</span>
      </span>
    </>
  );

  return (
    <div
      className={cx(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-xs rounded-lg border border-dashed border-border pr-xs",
        linked
          ? "bg-surface-card transition-colors duration-(--motion-fast) ease-skin has-[a:hover]:border-solid has-[a:hover]:border-primary has-[a:active]:border-solid has-[a:active]:border-primary has-[a:active]:bg-primary-wash"
          : "bg-surface-sunken",
      )}
    >
      {linked ? (
        <Link href={`/import/${draft.id}`} className={cx(innerClass, "focus-visible:outline-offset-2")}>
          {content}
        </Link>
      ) : (
        <div aria-busy="true" className={innerClass}>
          {content}
        </div>
      )}
      <IconButton label={`Discard draft: ${title}`} onClick={onDiscard}>
        <Trash2 aria-hidden="true" />
      </IconButton>
    </div>
  );
}
