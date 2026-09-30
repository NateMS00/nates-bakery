"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/components/ui/cx";
import type { Draft } from "@/lib/data/types";

// BONES Drafts: one row per draft, at most 3, then "Show all drafts (n)" expands in
// place. Importing rows aren't links yet; they turn into Ready to review without a
// reload, announced politely. SKIN draft-row.

const LIMIT = 3;

export function DraftsSection({ drafts, initiallyImporting }: { drafts: Draft[]; initiallyImporting: Set<string> }) {
  const [expanded, setExpanded] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const visible = expanded ? drafts : drafts.slice(0, LIMIT);
  const finished = drafts.filter((d) => initiallyImporting.has(d.id) && d.status === "ready");

  return (
    <section aria-labelledby="drafts-heading" className="mt-lg desktop:mt-xl">
      <SectionHeading id="drafts-heading">Drafts</SectionHeading>
      <ul ref={list} role="list" className="mt-sm flex flex-col gap-sm">
        {visible.map((draft) => (
          <li key={draft.id}>
            <DraftRow draft={draft} />
          </li>
        ))}
      </ul>
      {drafts.length > LIMIT && !expanded && (
        <Button
          variant="text"
          className="mt-xs -ml-sm"
          onClick={() => {
            setExpanded(true);
            // Move focus to the first row that just appeared.
            requestAnimationFrame(() => list.current?.children[LIMIT]?.querySelector<HTMLElement>("a, [tabindex]")?.focus());
          }}
        >
          Show all drafts ({drafts.length})
        </Button>
      )}
      <p role="status" className="sr-only">
        {finished.map((d) => `${draftTitle(d)} is ready to review.`).join(" ")}
      </p>
    </section>
  );
}

const draftTitle = (d: Draft) => d.title ?? `@${d.creatorHandle}'s reel`;

function DraftRow({ draft }: { draft: Draft }) {
  const ready = draft.status === "ready";
  const status = ready ? "Ready to review" : "Importing…";
  // Mobile: title, then "@creator · status". Tablet up: title | creator | status,
  // the meta spans joining the row's grid.
  const className = cx(
    "grid rounded-lg border border-dashed border-border px-base py-md tablet:grid-cols-[minmax(0,1fr)_minmax(0,calc(var(--col)*2))_auto] tablet:items-center tablet:gap-x-lg",
    ready
      ? "bg-surface-card transition-colors duration-(--motion-fast) ease-skin hover:border-solid hover:border-primary active:border-solid active:border-primary active:bg-primary-wash focus-visible:outline-offset-2"
      : "bg-surface-sunken",
  );
  const content = (
    <>
      <span className={cx("truncate type-body-md", ready ? "text-ink" : "text-muted")}>{draftTitle(draft)}</span>
      <span className="type-caption text-muted tablet:contents">
        <span className="tablet:truncate">@{draft.creatorHandle}</span>
        <span aria-hidden="true" className="tablet:hidden">
          {" · "}
        </span>
        <span className="tablet:text-right">{status}</span>
      </span>
    </>
  );

  if (!ready) {
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
