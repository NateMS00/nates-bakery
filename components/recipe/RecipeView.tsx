"use client";

import { Pencil, Share } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { ButtonLink } from "@/components/ui/Button";
import { CoverPicture } from "@/components/ui/CoverPicture";
import { FavoriteToggle } from "@/components/ui/FavoriteToggle";
import { IconButton, iconButtonClass } from "@/components/ui/IconButton";
import { Notice } from "@/components/ui/Notice";
import { Picture } from "@/components/ui/Picture";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionTabs, type SectionTabOption } from "@/components/ui/SectionTabs";
import { StarGlyph } from "@/components/ui/Star";
import { ExternalLink, TextLink, tallHitArea } from "@/components/ui/TextLink";
import { TABLET_UP, useMediaQuery } from "@/components/ui/useMediaQuery";
import { cx } from "@/components/ui/cx";
import { categoryLabel } from "@/lib/data/categories";
import { useOwnerRecipe } from "@/lib/data/useOwnerRecipe";
import type { BakeLogEntry, Recipe } from "@/lib/data/types";
import { formatBakeDate, formatDuration, formatScale, formatShortDate, formatYield, parseScale } from "@/lib/format";
import { IngredientList } from "./IngredientList";
import { ScaleControl } from "./ScaleControl";
import { ShareDialog } from "./ShareDialog";
import { StepList } from "./StepList";

// /recipes/:recipeId (Recipe), BONES-recipes-detail.md 1.6.0 (visual round): full-bleed
// cover with floating controls on mobile, cover beside the text from tablet up; a
// read-only rating line (the latest *rated* bake — Stage A's recipe_rating/
// deriveRecipeRating, never editable here); sticky section tabs that mark the section
// in view; Scale with no visible heading; Bakes (up to 3 entries) replaces the old
// Latest Bake card. Log bake and Start baking: a mobile action bar, or Start baking in
// the Header and Log bake heading Bakes from tablet up. Log bake just links to the
// existing entry form for now (/recipes/:id/log?new=1) — the Log sheet overlay is its
// own later stage. Mark as baked, its Undo, and the Rating prompt are gone: nothing is
// saved until a bake is logged, where rating is given directly.

const SECTIONS = ["ingredients", "steps", "bakes"] as const;
type SectionId = (typeof SECTIONS)[number];

export function RecipeView({ initial }: { initial: Recipe }) {
  const { recipe, actions } = useOwnerRecipe(initial);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { scale } = parseScale(searchParams.get("scale") ?? undefined);
  const tabletUp = useMediaQuery(TABLET_UP);

  const [shareOpen, setShareOpen] = useState(false);

  // Section tabs mark whichever section is nearest the top of the viewport, just below
  // the tabs' own sticky bar — not a tab panel switch, the sections are never hidden. A
  // plain scroll listener, not IntersectionObserver: that only wakes on threshold
  // crossings, which near the end of a short page (Bakes, with little content below it)
  // can stop firing once an element settles at the document's scroll limit, well short of
  // the trigger line — reading live positions on every scroll avoids that stale state.
  const [current, setCurrent] = useState<SectionId>("ingredients");
  useEffect(() => {
    const headings = SECTIONS.map((id) => document.getElementById(`${id}-heading`)).filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;
    const TRIGGER = 112; // px below the viewport top, clearing the sticky tabs bar
    let frame = 0;
    function update() {
      frame = 0;
      let next: SectionId = SECTIONS[0];
      let anyPassed = false;
      headings.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= TRIGGER) {
          next = SECTIONS[i];
          anyPassed = true;
        }
      });
      // A short last section (Never baked: Bakes is one line) can end the page before its
      // own heading ever reaches the trigger line — there's nowhere left to scroll, but it's
      // still the one actually on screen. Only promotes it when nothing else has passed the
      // trigger either: once an earlier section legitimately has (Bakes with real entries,
      // tall enough that reaching the document's end doesn't mean its own heading is near
      // the top yet), that section is still the one nearest the top, not Bakes.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
      if (atBottom && !anyPassed) next = SECTIONS[SECTIONS.length - 1];
      setCurrent(next);
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // A page short enough to need no scrolling at all (Never baked: Bakes is one line)
    // never fires either of the above even once — and a taller one's images can still be
    // loading in when this effect's first, synchronous update() runs, changing the
    // document's real height after the fact with nothing to react to it. A ResizeObserver
    // on the document catches both: any layout settling, not just an actual scroll.
    const observer = new ResizeObserver(onScroll);
    observer.observe(document.documentElement);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [recipe.id]);

  function setScale(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 1) params.delete("scale");
    else params.set("scale", String(next));
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  const estimates = recipe.ingredients.filter((i) => i.status === "estimated").length;
  const bakeHref = `/recipes/${recipe.id}/bake?scale=${scale}`;
  const logHref = `/recipes/${recipe.id}/log`;
  const hasCover = Boolean(recipe.cover);
  const bakesLabel = recipe.bakeLog.length > 0 ? `Bakes ${recipe.bakeLog.length}` : "Bakes";

  const tabOptions: SectionTabOption[] = tabletUp
    ? [
        { href: "#ingredients-heading", label: "Recipe" },
        { href: "#bakes-heading", label: bakesLabel },
      ]
    : [
        { href: "#ingredients-heading", label: "Ingredients" },
        { href: "#steps-heading", label: "Steps" },
        { href: "#bakes-heading", label: bakesLabel },
      ];
  const tabCurrent = tabletUp && current !== "bakes" ? "#ingredients-heading" : `#${current}-heading`;

  const startBakingLabel = (
    <>
      Start baking{scale !== 1 && <span className="tabular-nums"> · {formatScale(scale)}</span>}
    </>
  );

  return (
    <>
      {/* Header (SKELETON section 1) */}
      {hasCover ? (
        <>
          {/* data-replaces-header (globals.css): on mobile the cover IS the header — no
              logo row or tile band above it, starting flush under the status bar. main's
              own top padding is zeroed by that same rule, so nothing but this div decides
              the top offset here (none: it starts at true y=0). */}
          <div data-replaces-header className="-mx-(--gutter) tablet:hidden">
            <CoverPicture src={recipe.cover} recipeId={recipe.id} favorite={recipe.favorite} onFavoriteChange={actions.setFavorite} onShare={() => setShareOpen(true)} />
          </div>
          <div className="mt-base tablet:mt-0 tablet:grid tablet:grid-cols-8 tablet:items-start tablet:gap-x-(--gutter) desktop:grid-cols-12">
            <div className="hidden tablet:block tablet:col-span-5 desktop:col-span-8">
              <Picture src={recipe.cover} aspectRatio="4 / 3" rounded="lg" className="max-h-[56vh] w-full" />
            </div>
            <div className="tablet:col-span-3 desktop:col-span-4">
              <div className="hidden items-center gap-xs tablet:flex">
                <BackLink href="/recipes">Library</BackLink>
                <div className="ml-auto flex items-center gap-xs">
                  <FavoriteToggle pressed={recipe.favorite} onChange={actions.setFavorite} />
                  <IconButton label="Share" aria-haspopup="dialog" onClick={() => setShareOpen(true)}>
                    <Share aria-hidden="true" strokeWidth={1.8} />
                  </IconButton>
                  <Link href={`/recipes/${recipe.id}/edit`} aria-label="Edit" className={iconButtonClass}>
                    <Pencil aria-hidden="true" strokeWidth={1.8} />
                  </Link>
                </div>
              </div>
              <RecipeHeaderText recipe={recipe} scale={scale} className="mt-sm tablet:mt-base" />
              {/* A trailing `hidden` can't reliably beat Button's own unconditional
                  inline-flex at the same specificity (established this round) — hide the
                  wrapper, not the button. */}
              <div className="mt-base hidden tablet:block">
                <ButtonLink href={bakeHref} variant="primary" className="w-full">
                  {startBakingLabel}
                </ButtonLink>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-xs">
            <BackLink href="/recipes">Library</BackLink>
            <div className="ml-auto flex items-center gap-xs">
              <FavoriteToggle pressed={recipe.favorite} onChange={actions.setFavorite} />
              <IconButton label="Share" aria-haspopup="dialog" onClick={() => setShareOpen(true)}>
                <Share aria-hidden="true" strokeWidth={1.8} />
              </IconButton>
              <Link href={`/recipes/${recipe.id}/edit`} aria-label="Edit" className={iconButtonClass}>
                <Pencil aria-hidden="true" strokeWidth={1.8} />
              </Link>
              <div className="hidden tablet:block">
                <ButtonLink href={bakeHref} variant="primary">
                  {startBakingLabel}
                </ButtonLink>
              </div>
            </div>
          </div>
          <RecipeHeaderText recipe={recipe} scale={scale} className="mt-sm" />
        </>
      )}

      <SectionTabs options={tabOptions} current={tabCurrent} className="sticky top-0 z-20 -mx-(--gutter) mt-lg px-(--gutter) desktop:mt-xl" />

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

      <div className="mt-base tablet:grid tablet:grid-cols-8 tablet:items-start tablet:gap-x-(--gutter) desktop:grid-cols-12">
        {/* Left column: Scale (no visible heading) + Ingredients, sticky beside Steps from tablet up */}
        <div className="tablet:sticky tablet:top-touch-min tablet:col-span-4 desktop:col-span-4">
          <section aria-labelledby="scale-heading">
            <SectionHeading id="scale-heading" className="sr-only">
              Scale
            </SectionHeading>
            <ScaleControl scale={scale} onChange={setScale} />
          </section>
          <section aria-labelledby="ingredients-heading" className="mt-lg desktop:mt-xl">
            <SectionHeading id="ingredients-heading">Ingredients</SectionHeading>
            <IngredientList groups={recipe.ingredientGroups} ingredients={recipe.ingredients} scale={scale} />
          </section>
        </div>

        {/* Right column: Steps + Bakes */}
        <div className="tablet:col-span-4 desktop:col-span-8">
          <section aria-labelledby="steps-heading" className="mt-lg tablet:mt-0">
            <SectionHeading id="steps-heading">Steps</SectionHeading>
            <StepList groups={recipe.stepGroups} steps={recipe.steps} />
          </section>

          <section aria-labelledby="bakes-heading" className="mt-lg desktop:mt-xl">
            <div className="flex items-center justify-between gap-base">
              <SectionHeading id="bakes-heading">Bakes</SectionHeading>
              <div className="hidden tablet:block">
                <ButtonLink href={`${logHref}?new=1`} variant="secondary">
                  Log bake
                </ButtonLink>
              </div>
            </div>
            {recipe.bakeLog.length === 0 ? (
              <p className="mt-sm type-body-md text-muted">Not baked yet</p>
            ) : (
              <>
                <ul role="list" className="mt-sm flex flex-col gap-base">
                  {recipe.bakeLog.slice(0, 3).map((entry) => (
                    <li key={entry.id}>
                      <BakeEntryRow recipeId={recipe.id} entry={entry} />
                    </li>
                  ))}
                </ul>
                <TextLink href={logHref} className="mt-base inline-flex min-h-touch-min items-center type-body-md">
                  See all bakes ({recipe.bakeLog.length})
                </TextLink>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Action bar (mobile only): Log bake is in the Bakes heading and Start baking is
          in the Header from tablet up (both rendered above, hidden here instead). */}
      <div
        data-action-bar
        className="z-20 flex max-tablet:pin-bottom gap-sm bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:hidden"
      >
        <ButtonLink href={`${logHref}?new=1`} variant="secondary">
          Log bake
        </ButtonLink>
        <ButtonLink href={bakeHref} variant="primary" className="flex-1">
          {startBakingLabel}
        </ButtonLink>
      </div>

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} shareLink={recipe.shareLink} onCreate={actions.createShareLink} onRevoke={actions.revokeShareLink} />
    </>
  );
}

/** Category, H1, the one credit line, and the read-only rating line. Used beside or below the cover, and in the no-cover back row. */
function RecipeHeaderText({ recipe, scale, className }: { recipe: Recipe; scale: number; className?: string }) {
  const latest = recipe.bakeLog[0] ?? null;
  return (
    <div className={className}>
      <p className="type-label text-primary">{categoryLabel(recipe.category)}</p>
      <h1 className="mt-xs type-display-md text-ink desktop:type-display-lg">{recipe.title}</h1>
      <p className="mt-xs type-body-sm text-muted">
        <Dotted
          parts={[
            recipe.source && `@${recipe.source.creatorHandle}`,
            recipe.source && (
              <ExternalLink key="reel" href={recipe.source.reelUrl} className={tallHitArea}>
                Watch reel
              </ExternalLink>
            ),
            formatYield(recipe.yield, scale),
            recipe.totalTimeMinutes > 0 && <span className="whitespace-nowrap">{formatDuration(recipe.totalTimeMinutes)}</span>,
          ]}
        />
      </p>
      {/* Read-only: the latest rated bake (Stage A), never editable here — a bake's
          rating is given in the Log sheet. Tapping it jumps to Bakes. */}
      <a href="#bakes-heading" className={cx("mt-xs inline-flex min-h-touch-min items-center rounded-sm type-body-sm text-muted focus-visible:outline-offset-2", tallHitArea)}>
        {recipe.rating !== null && (
          <>
            <span className="sr-only">Rated {recipe.rating} out of 5, </span>
            <span className="mr-xs inline-flex gap-[1px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarGlyph key={n} filled={n <= recipe.rating!} className="size-[15px]" />
              ))}
            </span>
          </>
        )}
        {latest ? `Baked ${formatShortDate(latest.date)}` : "Not baked yet"}
      </a>
    </div>
  );
}

/** Joins the given parts (falsy ones dropped) with a decorative " · ", SKIN's inline-meta rule. */
function Dotted({ parts }: { parts: (ReactNode | null | undefined | false)[] }) {
  const items = parts.filter((p): p is ReactNode => Boolean(p));
  return items.map((item, i) => (
    <Fragment key={i}>
      {i > 0 && <span aria-hidden="true"> · </span>}
      {item}
    </Fragment>
  ));
}

/** One Bakes-section row: a 64px photo only when the bake has one (no photo → no square,
 * no placeholder; the text starts at the left edge), date + scale + stars, and a 2-line
 * "how it turned out" preview. One link to the Log sheet entry. */
function BakeEntryRow({ recipeId, entry }: { recipeId: string; entry: BakeLogEntry }) {
  const href = `/recipes/${recipeId}/log?edit=${encodeURIComponent(entry.id)}`;
  return (
    <Link
      href={href}
      className="group -m-xs flex min-h-touch-min items-center gap-base rounded-lg p-xs transition-colors duration-(--motion-fast) ease-skin hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      {entry.photo && <Picture src={entry.photo} aspectRatio="1 / 1" rounded="md" className="w-[64px]" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-sm gap-y-xs">
          <p className="type-body-md text-ink">
            <span className="font-bold">{formatBakeDate(entry.date)}</span>
            {entry.scale !== 1 && (
              <span className="text-muted">
                {" "}
                <span aria-hidden="true">·</span> <span className="sr-only">at </span>
                {formatScale(entry.scale)}
              </span>
            )}
          </p>
          {entry.rating !== null && (
            <span className="inline-flex shrink-0 items-center gap-[1px]">
              <span className="sr-only">Rated {entry.rating} out of 5</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <StarGlyph key={n} filled={n <= entry.rating!} className="size-[13px]" />
              ))}
            </span>
          )}
        </div>
        {entry.howItTurnedOut && <p className="mt-xs line-clamp-2 type-body-sm text-muted">{entry.howItTurnedOut}</p>}
      </div>
    </Link>
  );
}
