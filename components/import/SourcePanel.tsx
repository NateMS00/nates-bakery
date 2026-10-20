"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { RecordRow } from "@/components/ui/RecordRow";
import { cx } from "@/components/ui/cx";
import { ExternalLink } from "@/components/ui/TextLink";
import type { Draft } from "@/lib/data/types";

// BONES-import-detail 1.6.0 Source: a small source-card (SKIN) — the reel as a
// 64px-wide 9:16 frame with a round play badge, record rows beside it (reel: @creator
// · Watch reel; caption: its first 2 lines in the voice italic; language: only when
// translated). Below the card, when Instagram's length limit cut the caption short, a
// notice, then Read more / Show less expanding the full Original caption underneath.
// The caption starts collapsed every time the page opens; expanding doesn't move focus.

/** Blank lines would otherwise waste lines of the collapsed 3-line preview. */
function withoutBlankLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
}

type PictureStatus = "loading" | "loaded" | "error";

/**
 * The reel thumbnail (SKELETON 1.4.6): a signed Storage URL once the first-open
 * copy has succeeded, otherwise the same Play-icon placeholder as before — still
 * importing, the copy hasn't run yet, or it failed (nothing else breaks).
 */
function ReelThumbnail({ src }: { src: string | null }) {
  const [state, setState] = useState<{ src: string | null; status: PictureStatus }>({ src, status: src ? "loading" : "error" });
  if (state.src !== src) setState({ src, status: src ? "loading" : "error" });
  const status = state.status;

  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A cached image can finish loading (or fail) before onLoad/onError attach.
    const el = img.current;
    if (!el || !el.complete) return;
    setState((s) => (s.src === src ? { src, status: el.naturalWidth > 0 ? "loaded" : "error" } : s));
  }, [src]);

  return (
    <div
      aria-hidden="true"
      data-testid="reel-thumbnail"
      data-status={status}
      className="relative aspect-[9/16] w-3xl shrink-0 overflow-hidden rounded-md border border-outline bg-surface-sunken text-muted"
    >
      {src && status !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element -- a signed Storage URL that expires in an hour; next/image's remote-pattern allowlist doesn't fit that.
        <img
          ref={img}
          src={src}
          alt=""
          loading="lazy"
          onLoad={() => setState({ src, status: "loaded" })}
          onError={() => setState({ src, status: "error" })}
          className={cx("size-full object-cover object-center", status !== "loaded" && "opacity-0")}
        />
      )}
      {/* The round play badge: solid even over a busy photo, never just the icon alone. */}
      <span className="absolute inset-0 m-auto grid size-icon place-items-center rounded-full border border-outline bg-canvas text-ink">
        <Play className="size-icon-sm" strokeWidth={1.8} fill="currentColor" />
      </span>
    </div>
  );
}

export function SourcePanel({ draft, expanded, onExpandedChange }: { draft: Draft; expanded: boolean; onExpandedChange: (v: boolean) => void }) {
  const { caption, captionCutOff, captionLanguage } = draft;
  const translatedFrom = captionLanguage && captionLanguage !== "English" ? captionLanguage : null;
  const [id] = useState(() => `caption-${draft.id}`);
  // Which row is last decides who gives up their closing rule (SKIN record-row).
  const captionIsLastRow = Boolean(caption) && !translatedFrom;
  const reelIsLastRow = !caption;

  return (
    <section aria-labelledby="source-heading">
      <h2 id="source-heading" className="sr-only">
        Source
      </h2>
      <div data-testid="source-card" className="flex gap-base rounded-tile border border-outline bg-canvas p-base">
        <ExternalLink href={draft.reelUrl} aria-label={`Watch @${draft.creatorHandle}'s reel`} className="shrink-0 rounded-md focus-visible:outline-offset-2">
          <ReelThumbnail src={draft.picture ?? null} />
        </ExternalLink>
        <dl className="min-w-0 flex-1">
          <RecordRow label="reel" noRule={reelIsLastRow}>
            <span className="type-body-sm text-muted">
              <span className="text-ink">@{draft.creatorHandle}</span> ·{" "}
              <ExternalLink href={draft.reelUrl} className="inline-flex min-h-touch-min items-center">
                Watch reel
              </ExternalLink>
            </span>
          </RecordRow>
          {caption && (
            <RecordRow label="caption" stacked noRule={captionIsLastRow}>
              <p className="line-clamp-2 type-voice text-ink">{withoutBlankLines(caption)}</p>
            </RecordRow>
          )}
          {translatedFrom && (
            <RecordRow label="language" noRule>
              <span className="type-body-sm text-muted">
                {translatedFrom}, translated
              </span>
            </RecordRow>
          )}
        </dl>
      </div>
      {caption && (
        <div className="mt-base">
          {captionCutOff && (
            <Notice tone="info" className="mt-xs">
              Instagram cut this caption off. Check the reel for the rest.
            </Notice>
          )}
          <Button variant="text" aria-expanded={expanded} aria-controls={id} onClick={() => onExpandedChange(!expanded)} className="-ml-sm">
            {expanded ? "Show less" : "Read more"}
          </Button>
          {expanded && (
            <div id={id} className="mt-xs">
              <span className="type-label text-muted">
                Original caption
                {translatedFrom && <span className="font-normal"> · Translated from {translatedFrom}</span>}
              </span>
              {/* Keep the caption's own line breaks — checking it line by line is the point of showing it. */}
              <p className="mt-xs whitespace-pre-line type-body-sm text-body">{caption}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
