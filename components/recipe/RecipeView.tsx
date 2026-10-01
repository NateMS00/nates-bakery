"use client";

import { Pencil, Share } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FavoriteToggle } from "@/components/ui/FavoriteToggle";
import { IconButton, iconButtonClass } from "@/components/ui/IconButton";
import { InlineConfirmation } from "@/components/ui/InlineConfirmation";
import { Notice } from "@/components/ui/Notice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarRating } from "@/components/ui/StarRating";
import { ExternalLink, TextLink, tallHitArea } from "@/components/ui/TextLink";
import { categoryLabel } from "@/lib/data/categories";
import { useOwnerRecipe } from "@/lib/data/useOwnerRecipe";
import type { BakeLogEntry, Recipe } from "@/lib/data/types";
import { formatBakeDate, formatDuration, formatScale, formatYield, parseScale, todayIso } from "@/lib/format";
import { IngredientList } from "./IngredientList";
import { RatingPrompt } from "./RatingPrompt";
import { ScaleControl } from "./ScaleControl";
import { ShareDialog } from "./ShareDialog";
import { StepList } from "./StepList";
import Link from "next/link";

// /recipes/:recipeId (Recipe), BONES-recipes-detail.md. Sections in SKELETON order:
// Header, Scale, Ingredients, Steps, Latest Bake; Start baking is in the Header's
// DOM and pinned to the bottom edge on mobile.

const JUST_MARKED_MS = 10_000;

export function RecipeView({ initial }: { initial: Recipe }) {
  const { recipe, actions } = useOwnerRecipe(initial);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { scale } = parseScale(searchParams.get("scale") ?? undefined);

  const [shareOpen, setShareOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [justMarked, setJustMarked] = useState<{ entry: BakeLogEntry } | null>(null);
  const shareButton = useRef<HTMLButtonElement>(null);
  const markButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!justMarked) return;
    const t = window.setTimeout(() => setJustMarked(null), JUST_MARKED_MS);
    return () => window.clearTimeout(t);
  }, [justMarked]);

  // "Just marked" lasts until the next action or 10 seconds (BONES).
  const nextAction = () => setJustMarked(null);

  function setScale(next: number) {
    nextAction();
    const params = new URLSearchParams(searchParams.toString());
    if (next === 1) params.delete("scale");
    else params.set("scale", String(next));
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  async function markAsBaked() {
    const entry = await actions.addBake({ date: todayIso(), scale });
    if (!entry) return;
    setJustMarked({ entry });
    if (recipe.rating === null) setRatingOpen(true);
  }

  function undoMark() {
    if (justMarked) actions.removeBake(justMarked.entry.id);
    setJustMarked(null);
    markButton.current?.focus();
  }

  const estimates = recipe.ingredients.filter((i) => i.status === "estimated").length;
  const latest = recipe.bakeLog[0];
  const bakeHref = `/recipes/${recipe.id}/bake?scale=${scale}`;
  const logHref = `/recipes/${recipe.id}/log`;

  return (
    <>
      {/* Header (SKELETON section 1) */}
      <div className="grid grid-cols-[1fr_auto] gap-x-lg [grid-template-areas:'back_actions''title_title'] tablet:[grid-template-areas:'back_.''category_.''h1_actions''meta_.']">
        <BackLink href="/recipes" className="self-center justify-self-start [grid-area:back]">
          Library
        </BackLink>

        <div className="flex items-center gap-xs self-center justify-self-end [grid-area:actions]">
          <FavoriteToggle
            pressed={recipe.favorite}
            onChange={(v) => {
              nextAction();
              actions.setFavorite(v);
            }}
          />
          <IconButton
            ref={shareButton}
            label="Share"
            aria-haspopup="dialog"
            onClick={() => {
              nextAction();
              setShareOpen(true);
            }}
          >
            <Share aria-hidden="true" strokeWidth={1.8} />
          </IconButton>
          <Link href={`/recipes/${recipe.id}/edit`} aria-label="Edit" className={iconButtonClass}>
            <Pencil aria-hidden="true" strokeWidth={1.8} />
          </Link>
          {/* Start baking bar (primary action): action-bar on mobile, in the Header from tablet up. */}
          <div
            data-action-bar
            className="z-20 max-tablet:pin-bottom bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:z-auto tablet:ml-sm tablet:bg-transparent tablet:p-0 tablet:shadow-none"
          >
            <ButtonLink href={bakeHref} variant="primary" className="w-full tablet:w-auto">
              Start baking{scale !== 1 && <span className="tabular-nums"> · {formatScale(scale)}</span>}
            </ButtonLink>
          </div>
        </div>

        {/* From tablet up the title block's parts join the header grid, so the actions align with the title. */}
        <div className="[grid-area:title] tablet:contents">
          <p className="mt-sm type-label text-primary tablet:[grid-area:category]">{categoryLabel(recipe.category)}</p>
          <h1 className="mt-xs type-display-md text-ink tablet:[grid-area:h1] desktop:type-display-lg">{recipe.title}</h1>
          <div className="tablet:[grid-area:meta]">
            <StarRating
              value={recipe.rating}
              showUnrated
              className="mt-xs"
              onChange={(v) => {
                nextAction();
                actions.setRating(v);
              }}
            />
            {recipe.source && (
              <p className="type-body-sm text-muted">
                @{recipe.source.creatorHandle} <span aria-hidden="true">·</span>{" "}
                <ExternalLink href={recipe.source.reelUrl} className={tallHitArea}>
                  Watch reel
                </ExternalLink>
              </p>
            )}
            <p className="mt-xs type-body-sm text-body">
              {formatYield(recipe.yield, scale)}
              {recipe.totalTimeMinutes > 0 && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="sr-only">, total time </span>
                  {formatDuration(recipe.totalTimeMinutes)}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* State: Has estimates */}
      {estimates > 0 && (
        <Notice
          tone="warning"
          className="mt-base"
          action={
            <ButtonLink href={`/recipes/${recipe.id}/edit`} variant="text" className="-my-md -ml-sm underline">
              {estimates === 1 ? "Confirm it" : "Confirm them"}
            </ButtonLink>
          }
        >
          {estimates === 1 ? "1 amount is an estimate." : `${estimates} amounts are estimates.`}
        </Notice>
      )}

      <div className="mt-lg tablet:grid tablet:grid-cols-8 tablet:items-start tablet:gap-x-(--gutter) desktop:mt-xl desktop:grid-cols-12">
        {/* Left column: Scale + Ingredients, sticky beside Steps from tablet up */}
        <div className="tablet:sticky tablet:top-base tablet:col-span-4 desktop:col-span-4">
          <section aria-labelledby="scale-heading">
            <SectionHeading id="scale-heading">Scale</SectionHeading>
            <ScaleControl scale={scale} onChange={setScale} />
          </section>
          <section aria-labelledby="ingredients-heading" className="mt-lg desktop:mt-xl">
            <SectionHeading id="ingredients-heading">Ingredients</SectionHeading>
            <IngredientList groups={recipe.ingredientGroups} ingredients={recipe.ingredients} scale={scale} />
          </section>
        </div>

        {/* Right column: Steps + Latest Bake */}
        <div className="tablet:col-span-4 desktop:col-span-8">
          <section aria-labelledby="steps-heading" className="mt-lg tablet:mt-0">
            <SectionHeading id="steps-heading">Steps</SectionHeading>
            <StepList groups={recipe.stepGroups} steps={recipe.steps} />
          </section>

          <section aria-labelledby="latest-bake-heading" className="mt-lg desktop:mt-xl">
            <SectionHeading id="latest-bake-heading">Latest bake</SectionHeading>
            <Card className="mt-sm">
              {justMarked && (
                <InlineConfirmation className="mb-md">
                  <span>
                    Marked as baked today <span aria-hidden="true">·</span>
                  </span>
                  <Button variant="text" onClick={undoMark} className="-my-md -ml-sm">
                    Undo
                  </Button>
                </InlineConfirmation>
              )}
              {latest ? (
                <>
                  <p className="type-body-md text-ink">
                    <span className="font-bold">{formatBakeDate(latest.date)}</span>{" "}
                    <span className="text-muted">
                      <span aria-hidden="true">·</span> <span className="sr-only">at </span>
                      {formatScale(latest.scale)}
                    </span>
                  </p>
                  {latest.whatChanged || latest.howItTurnedOut ? (
                    <dl>
                      {latest.whatChanged && (
                        <>
                          <dt className="mt-md type-label text-muted">What changed</dt>
                          <dd className="mt-xs line-clamp-2 type-body-sm text-body">{latest.whatChanged}</dd>
                        </>
                      )}
                      {latest.howItTurnedOut && (
                        <>
                          <dt className="mt-md type-label text-muted">How it turned out</dt>
                          <dd className="mt-xs line-clamp-2 type-body-sm text-body">{latest.howItTurnedOut}</dd>
                        </>
                      )}
                    </dl>
                  ) : (
                    <TextLink href={`${logHref}?edit=${encodeURIComponent(latest.id)}`} className="mt-xs inline-flex min-h-touch-min items-center type-body-md">
                      Add notes
                    </TextLink>
                  )}
                </>
              ) : (
                <p className="type-body-md text-muted">Not baked yet</p>
              )}
              <div className="mt-base flex flex-col items-start gap-sm tablet:flex-row tablet:flex-wrap tablet:items-center tablet:justify-between">
                <Button ref={markButton} variant="secondary" onClick={markAsBaked}>
                  Mark as baked
                </Button>
                {latest && (
                  <TextLink href={logHref} className="inline-flex min-h-touch-min items-center type-body-md">
                    See all bakes ({recipe.bakeLog.length})
                  </TextLink>
                )}
              </div>
            </Card>
          </section>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareLink={recipe.shareLink}
        onCreate={actions.createShareLink}
        onRevoke={actions.revokeShareLink}
        returnFocus={shareButton}
      />
      <RatingPrompt
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onRate={(n) => {
          actions.setRating(n);
          setRatingOpen(false);
        }}
        returnFocus={markButton}
      />
    </>
  );
}
