"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/components/ui/cx";
import type { Draft } from "@/lib/data/types";

// BONES Drafts: one row per draft, at most 2 on mobile and 3 from tablet up, then
// "Show all drafts (n)" expands in place. Importing rows aren't links yet; they turn into Ready to review without a
// reload, announced politely. SKIN draft-row.

const LIMIT_MOBILE = 2;
const LIMIT = 3;

export function DraftsSection({ drafts, initiallyImporting }: { drafts: Draft[]; initiallyImporting: Set<string> }) {
  const [expanded, setExpanded] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const visible = expanded ? drafts : drafts.slice(0, LIMIT);
  // The third row and the button switch by breakpoint in CSS, so there's no layout jump.
  const buttonClass = drafts.length > LIMIT ? "" : drafts.length > LIMIT_MOBILE ? "tablet:hidden" : "hidden";
  const finished = drafts.filter((d) => initiallyImporting.has(d.id) && (d.status === "ready" || d.status === "failed"));

  return (
    <section aria-labelledby="drafts-heading" className="mt-lg desktop:mt-xl">
      <SectionHeading id="drafts-heading">Drafts</SectionHeading>
      <ul ref={list} role="list" className="mt-sm flex flex-col gap-sm">
        {visible.map((draft, i) => (
          <li key={draft.id} className={!expanded && i >= LIMIT_MOBILE ? "max-tablet:hidden" : undefined}>
            <DraftRow draft={draft} />
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
      <p role="status" className="sr-only">
        {finished.map((d) => (d.status === "failed" ? `${draftTitle(d)} couldn't finish importing.` : `${draftTitle(d)} is ready to review.`)).join(" ")}
      </p>
    </section>
  );
}

const draftTitle = (d: Draft) => d.title ?? `@${d.creatorHandle}'s reel`;

function DraftRow({ draft }: { draft: Draft }) {
  const linked = draft.status === "ready" || draft.status === "failed";
  const status = draft.status === "ready" ? "Ready to review" : draft.status === "failed" ? "Couldn't finish" : "Importing…";
  // Mobile: title, then "@creator · status". Tablet up: title | creator | status,
  // the meta spans joining the row's grid.
  const className = cx(
    "grid rounded-lg border border-dashed border-border px-base py-md tablet:grid-cols-[minmax(0,1fr)_minmax(0,calc(var(--col)*2))_auto] tablet:items-center tablet:gap-x-lg",
    linked
      ? "bg-surface-card transition-colors duration-(--motion-fast) ease-skin hover:border-solid hover:border-primary active:border-solid active:border-primary active:bg-primary-wash focus-visible:outline-offset-2"
      : "bg-surface-sunken",
  );
  const content = (
    <>
      <span className={cx("truncate type-body-md", linked ? "text-ink" : "text-muted")}>{draftTitle(draft)}</span>
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

  if (!linked) {
    return (
      <div aria-busy="true" className={className}>
        {content}
      </div>
    );
  }
  return (
    <Link href={`/import/${draft.id}`} className={className}>
      {content}
    </Link>
  );
}
