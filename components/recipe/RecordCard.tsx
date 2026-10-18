import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { StarGlyph } from "@/components/ui/Star";
import { ExternalLink, tallHitArea } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { categoryLabel } from "@/lib/data/categories";
import type { Recipe } from "@/lib/data/types";
import { formatDurationCompact, formatScale, formatShortDate, formatYieldCompact } from "@/lib/format";

/**
 * SKIN record-card + record-row: the recipe as a catalogue record — a `dl` of
 * label-mono/value rows (recipe, from, kind, rating, baked, yield), each closed
 * by an ink rule. The title row's value is the page's H1. Desktop adds the two
 * actions (Start baking, Log bake) at the bottom; mobile and tablet keep those in
 * the action bar instead, so `actions` is only passed on desktop.
 */
export function RecordCard({
  recipe,
  scale,
  bakeHref,
  logHref,
  actions = false,
  className,
}: {
  recipe: Recipe;
  scale: number;
  bakeHref: string;
  logHref: string;
  /** Desktop only: Start baking + Log bake at the bottom of the card. */
  actions?: boolean;
  className?: string;
}) {
  const latest = recipe.bakeLog[0] ?? null;
  const bakedLabel = latest ? `${recipe.bakeLog.length} ${recipe.bakeLog.length === 1 ? "time" : "times"} · last ${formatShortDate(latest.date)}` : "Not yet";
  const durationLabel = recipe.totalTimeMinutes > 0 ? formatDurationCompact(recipe.totalTimeMinutes) : null;

  return (
    <div data-testid="record-card" className={cx("rounded-tile border border-outline bg-canvas p-base text-ink", className)}>
      <dl>
        <Row label="recipe">
          <h1 className="type-heading">{recipe.title}</h1>
        </Row>
        {recipe.source && (
          <Row label="from">
            <span className="type-voice">
              @{recipe.source.creatorHandle} ·{" "}
              <ExternalLink href={recipe.source.reelUrl} className={tallHitArea}>
                Watch reel
              </ExternalLink>
            </span>
          </Row>
        )}
        <Row label="kind">
          <span className="type-body-md">{categoryLabel(recipe.category)}</span>
        </Row>
        {recipe.rating !== null && (
          <Row label="rating">
            <a href="#bakes-heading" className={cx("inline-flex items-center gap-[1px] rounded-sm focus-visible:outline-offset-2", tallHitArea)}>
              <span className="sr-only">Rated {recipe.rating} out of 5, jump to Bakes</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <StarGlyph key={n} filled={n <= recipe.rating!} className="size-[15px]" />
              ))}
            </a>
          </Row>
        )}
        <Row label="baked">
          <span className="type-body-md">{bakedLabel}</span>
        </Row>
        <Row label="yield">
          <span className="type-body-md">
            {formatYieldCompact(recipe.yield, scale)}
            {durationLabel && <span className="text-muted"> · {durationLabel}</span>}
          </span>
        </Row>
      </dl>
      {actions && (
        <div className="mt-base flex gap-sm">
          <ButtonLink href={bakeHref} variant="primary" className="flex-1">
            Start baking{scale !== 1 && <span className="tabular-nums"> · {formatScale(scale)}</span>}
          </ButtonLink>
          <ButtonLink href={`${logHref}?new=1`} variant="secondary" className="flex-1">
            Log bake
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-base border-b border-outline py-sm">
      <dt className="type-label-mono shrink-0 text-muted">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
