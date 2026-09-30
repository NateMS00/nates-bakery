"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExternalLink } from "@/components/ui/TextLink";
import type { Draft } from "@/lib/data/types";

// BONES Source: reel thumbnail (portrait 9:16), creator handle, Watch reel, and the
// transcript (Caption, then Spoken) collapsed to 3 lines, with Read more / Show less.
// Starts collapsed every time; expanding doesn't move focus.

export function SourcePanel({ draft, expanded, onExpandedChange }: { draft: Draft; expanded: boolean; onExpandedChange: (v: boolean) => void }) {
  const { caption, spoken } = draft.transcript ?? {};
  const parts = [caption && { label: "Caption", text: caption }, spoken && { label: "Spoken", text: spoken }].filter(Boolean) as { label: string; text: string }[];
  const [id] = useState(() => `transcript-${draft.id}`);

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
          <ExternalLink href={draft.reelUrl} className="inline-flex min-h-touch-min items-center max-tablet:inline">
            Watch reel
          </ExternalLink>
        </p>
      </div>
      {parts.length > 0 && (
        <div className="mt-base">
          <span className="type-label text-muted">Transcript</span>
          <div id={id} className="mt-xs type-body-sm text-body">
            {expanded ? (
              parts.map((p) => (
                <p key={p.label} className="mt-sm first:mt-0">
                  <span className="font-bold text-ink">{p.label}:</span> {p.text}
                </p>
              ))
            ) : (
              <p className="line-clamp-3">
                {parts.map((p) => (
                  <span key={p.label}>
                    <span className="font-bold text-ink">{p.label}:</span> {p.text}{" "}
                  </span>
                ))}
              </p>
            )}
          </div>
          <Button variant="text" aria-expanded={expanded} aria-controls={id} onClick={() => onExpandedChange(!expanded)} className="-ml-sm">
            {expanded ? "Show less" : "Read more"}
          </Button>
        </div>
      )}
    </section>
  );
}
