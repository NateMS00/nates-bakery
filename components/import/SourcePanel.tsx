"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cx } from "@/components/ui/cx";
import { ExternalLink, tallHitArea } from "@/components/ui/TextLink";
import type { Draft } from "@/lib/data/types";

// BONES-import-detail 1.4.0 Source: reel thumbnail (portrait 9:16), creator handle,
// Watch reel, and the original caption (labeled "Translated from" when translated,
// with a cut-off notice when Instagram's length limit cut it short), collapsed to 3
// lines, with Read more / Show less. Starts collapsed every time; expanding doesn't
// move focus.

/** Blank lines would otherwise waste lines of the collapsed 3-line preview. */
function withoutBlankLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
}

export function SourcePanel({ draft, expanded, onExpandedChange }: { draft: Draft; expanded: boolean; onExpandedChange: (v: boolean) => void }) {
  const { caption, captionCutOff, captionLanguage } = draft;
  const translatedFrom = captionLanguage && captionLanguage !== "English" ? captionLanguage : null;
  const [id] = useState(() => `caption-${draft.id}`);

  return (
    <section aria-labelledby="source-heading">
      <SectionHeading id="source-heading">Source</SectionHeading>
      <div className="mt-sm flex items-center gap-md tablet:items-start">
        {/* Neutral placeholder until reel thumbnails come from the import service */}
        <div aria-hidden="true" className="grid aspect-[9/16] w-[calc(var(--spacing-2xl)-var(--spacing-sm))] shrink-0 place-items-center rounded-md border border-hairline bg-surface-sunken text-muted desktop:w-3xl">
          <Play className="size-icon" strokeWidth={1.6} />
        </div>
        <p className="type-body-sm text-muted tablet:flex tablet:flex-col tablet:gap-xs">
          <span className="text-ink">@{draft.creatorHandle}</span>
          <span aria-hidden="true" className="tablet:hidden"> · </span>
          <ExternalLink href={draft.reelUrl} className={cx("inline-flex min-h-touch-min items-center max-tablet:inline", tallHitArea)}>
            Watch reel
          </ExternalLink>
        </p>
      </div>
      {caption && (
        <div className="mt-base">
          <span className="type-label text-muted">
            Original caption
            {translatedFrom && <span className="font-normal"> · Translated from {translatedFrom}</span>}
          </span>
          {captionCutOff && (
            <Notice tone="info" className="mt-xs">
              Instagram cut this caption off. Check the reel for the rest.
            </Notice>
          )}
          <div id={id} className="mt-xs type-body-sm text-body">
            {/* Keep the caption's own line breaks — checking it line by line is the point of showing it.
                Collapsed, blank lines are dropped first so all 3 lines are real text. */}
            <p className={cx("whitespace-pre-line", !expanded && "line-clamp-3")}>{expanded ? caption : withoutBlankLines(caption)}</p>
          </div>
          <Button variant="text" aria-expanded={expanded} aria-controls={id} onClick={() => onExpandedChange(!expanded)} className="-ml-sm">
            {expanded ? "Show less" : "Read more"}
          </Button>
        </div>
      )}
    </section>
  );
}
