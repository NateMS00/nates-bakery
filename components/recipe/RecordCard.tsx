import { ButtonLink } from "@/components/ui/Button";
import { RecordRow } from "@/components/ui/RecordRow";
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
        <RecordRow label="recipe" stacked>
          <h1 className="type-heading">{recipe.title}</h1>
        </RecordRow>
        {recipe.source && (
          <RecordRow label="from">
            <span className="type-voice">
              @{recipe.source.creatorHandle} ·{" "}
              <ExternalLink href={recipe.source.reelUrl} className={tallHitArea}>
                Watch reel
              </ExternalLink>
            </span>
          </RecordRow>
        )}
        <RecordRow label="kind">
          <span className="type-body-md">{categoryLabel(recipe.category)}</span>
        </RecordRow>
        {recipe.rating !== null && (
          <RecordRow label="rating">
            <a href="#bakes-heading" className={cx("inline-flex items-center gap-[1px] rounded-sm focus-visible:outline-offset-2", tallHitArea)}>
              <span className="sr-only">Rated {recipe.rating} out of 5, jump to Bakes</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <StarGlyph key={n} filled={n <= recipe.rating!} className="size-[15px]" />
              ))}
            </a>
          </RecordRow>
        )}
        <RecordRow label="baked">
          <span className="type-body-md">{bakedLabel}</span>
        </RecordRow>
        <RecordRow label="yield">
          <span className="type-body-md">
            {formatYieldCompact(recipe.yield, scale)}
            {durationLabel && <span className="text-muted"> · {durationLabel}</span>}
          </span>
        </RecordRow>
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
