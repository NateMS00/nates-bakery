"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { InlineConfirmation } from "@/components/ui/InlineConfirmation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/components/ui/cx";
import { discardDraftOptimistic, undoDiscard, usePendingDiscard } from "@/lib/data/store";
import type { Draft } from "@/lib/data/types";

// BONES Drafts: one row per draft, at most 2 on mobile and 3 from tablet up, then
// "Show all drafts (n)" expands in place. Importing rows aren't links yet; they turn
// into Ready to review or Couldn't finish without a reload, announced politely. Every
// row ends with Discard (BONES-recipes.md 1.4.0): removes the row at once, "Draft
// discarded" with Undo for 10 seconds, no confirmation dialog. SKIN draft-row.

const LIMIT_MOBILE = 2;
const LIMIT = 3;

export function DraftsSection({ drafts, initiallyImporting }: { drafts: Draft[]; initiallyImporting: Set<string> }) {
  const [expanded, setExpanded] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const visible = expanded ? drafts : drafts.slice(0, LIMIT);
  // The third row and the button switch by breakpoint in CSS, so there's no layout jump.
  const buttonClass = drafts.length > LIMIT ? "" : drafts.length > LIMIT_MOBILE ? "tablet:hidden" : "hidden";
  const finished = drafts.filter((d) => initiallyImporting.has(d.id) && (d.status === "ready" || d.status === "failed"));
  const pendingDiscard = usePendingDiscard();

  function discard(draft: Draft, index: number) {
    discardDraftOptimistic(draft.id);
    // The row at this index is now the one that follows the discarded row (everything
    // shifted up); if there isn't one, this was the last draft (BONES-recipes.md).
    requestAnimationFrame(() => {
      const next = list.current?.children[index]?.querySelector<HTMLElement>("a, button");
      if (next) next.focus();
      else document.getElementById("recipes-heading")?.focus();
    });
  }

  return (
    <section aria-labelledby="drafts-heading" className="mt-lg desktop:mt-xl">
      <SectionHeading id="drafts-heading">Drafts</SectionHeading>
      <ul ref={list} role="list" className="mt-sm flex flex-col gap-sm">
        {visible.map((draft, i) => (
          <li key={draft.id} className={!expanded && i >= LIMIT_MOBILE ? "max-tablet:hidden" : undefined}>
            <DraftRow draft={draft} onDiscard={() => discard(draft, i)} />
          </li>
        ))}
      </ul>
      {drafts.length > LIMIT_MOBILE && !expanded && (
        <Button
          variant="text"
          className={cx("mt-xs -ml-sm", buttonClass)}
          onClick={() => {
            const firstNew = window.matchMedia("(min-width: 768px)").matches ? LIMIT : LIMIT_MOBILE;
            setExpanded(true);
            // Move focus to the first row that just appeared (Importing rows aren't focusable).
            requestAnimationFrame(() => {
              const rows = Array.from(list.current?.children ?? []).slice(firstNew);
              rows.map((r) => r.querySelector<HTMLElement>("a")).find(Boolean)?.focus();
            });
          }}
        >
          Show all drafts ({drafts.length})
        </Button>
      )}
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
