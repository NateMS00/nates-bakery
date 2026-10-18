"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CoverPicture } from "@/components/ui/CoverPicture";
import { HeroControls } from "@/components/ui/HeroControls";
import { HeroField } from "@/components/ui/HeroField";
import { Notice } from "@/components/ui/Notice";
import { Picture } from "@/components/ui/Picture";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionTabs, type SectionTabOption } from "@/components/ui/SectionTabs";
import { StarGlyph } from "@/components/ui/Star";
import { TextLink } from "@/components/ui/TextLink";
import { TABLET_UP, useMediaQuery } from "@/components/ui/useMediaQuery";
import { useOwnerRecipe } from "@/lib/data/useOwnerRecipe";
import type { BakeLogEntry, Recipe } from "@/lib/data/types";
import { formatBakeDate, formatScale, parseScale } from "@/lib/format";
import { IngredientList } from "./IngredientList";
import { NoCoverHero } from "./NoCoverHero";
import { RecordCard } from "./RecordCard";
import { ScaleControl } from "./ScaleControl";
import { ShareDialog } from "./ShareDialog";
import { SplitHero } from "./SplitHero";
import { StepList } from "./StepList";

// /recipes/:recipeId (Recipe), BONES-recipes-detail.md 1.7.0 (personality round): the
// Header becomes the Hero with a record card (recipe, from, kind, rating, baked,
// yield): desktop (1280px+, with a cover) gets a split hero — the bake photo staged
// like a framed print on the left, with its photo switch, and the record card (with
// both actions) centred on an azulejo field on the right; mobile and tablet keep the
// full-bleed/inset cover (or, with no cover, a 200px azulejo field) with the card
// overlapping its bottom edge by 32px, and the actions move to a sticky action bar.
// Scale is now choice radios on the Ingredients heading's own line. The latest bake's
// "What changed" note, when there is one, opens Steps as a quoted line.

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
  const latestNote = recipe.bakeLog[0]?.whatChanged;

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

  return (
    <>
      {/* Hero (SKELETON section 1). Both tiers render in the DOM at once, CSS-gated
          by breakpoint (not a JS media query) — a useMediaQuery branch here would
          flash the wrong hero on first paint, since it always reads false on the
          server. hasCover is plain data, known at render time either way. */}
      <div className="desktop:hidden">
        {/* data-replaces-header (globals.css): on mobile the cover (or, with no
            cover, the azulejo field) IS the header — no logo row or tile band
            above it, starting flush under the status bar. main's own top padding
            is zeroed by that same rule, so nothing but this div decides the top
            offset here (none: it starts at true y=0). */}
        {hasCover ? (
          <>
            <div data-replaces-header className="-mx-(--gutter) tablet:hidden">
              <CoverPicture src={recipe.cover} recipeId={recipe.id} favorite={recipe.favorite} onFavoriteChange={actions.setFavorite} onShare={() => setShareOpen(true)} />
            </div>
            <div className="hidden tablet:block">
              <Picture src={recipe.cover} aspectRatio="4 / 3" rounded="lg" className="max-h-[56vh] w-full">
                <HeroControls recipeId={recipe.id} favorite={recipe.favorite} onFavoriteChange={actions.setFavorite} onShare={() => setShareOpen(true)} />
              </Picture>
            </div>
          </>
        ) : (
          <>
            <div data-replaces-header className="-mx-(--gutter) tablet:hidden">
              <HeroField recipeId={recipe.id} favorite={recipe.favorite} onFavoriteChange={actions.setFavorite} onShare={() => setShareOpen(true)} />
            </div>
            <div className="hidden tablet:block">
              <HeroField recipeId={recipe.id} favorite={recipe.favorite} onFavoriteChange={actions.setFavorite} onShare={() => setShareOpen(true)} />
            </div>
          </>
        )}
        <RecordCard recipe={recipe} scale={scale} bakeHref={bakeHref} logHref={logHref} className="relative z-10 mx-(--gutter) -mt-xl tablet:mx-0" />
      </div>
      <div className="hidden desktop:block">
        {hasCover ? (
          <SplitHero
            recipe={recipe}
            scale={scale}
            favorite={recipe.favorite}
            onFavoriteChange={actions.setFavorite}
            onShare={() => setShareOpen(true)}
            bakeHref={bakeHref}
            logHref={logHref}
          />
        ) : (
          <NoCoverHero
            recipe={recipe}
            scale={scale}
            favorite={recipe.favorite}
            onFavoriteChange={actions.setFavorite}
            onShare={() => setShareOpen(true)}
            bakeHref={bakeHref}
            logHref={logHref}
          />
        )}
      </div>

      <SectionTabs options={tabOptions} current={tabCurrent} className="sticky top-0 z-20 mt-2xl desktop:mt-section-lg" />

      {estimates > 0 && (
        <Notice
          tone="warning"
          className="mt-base"
          action={
            <ButtonLink href={`/recipes/${recipe.id}/edit`} variant="text" className="-my-md -ml-sm">
              {estimates === 1 ? "Confirm it" : "Confirm them"}
            </ButtonLink>
          }
        >
          {estimates === 1 ? "1 amount is an estimate." : `${estimates} amounts are estimates.`}
        </Notice>
      )}

      <div className="mt-lg tablet:grid tablet:items-start tablet:grid-cols-8 tablet:gap-x-(--gutter) desktop:mt-xl desktop:grid-cols-12">
        {/* Left column: Ingredients, with Scale on its heading line, sticky beside Steps from tablet up */}
        <div className="tablet:sticky tablet:top-touch-min tablet:col-span-4 desktop:col-span-4">
          <section aria-labelledby="ingredients-heading">
            <SectionHeading id="ingredients-heading">Ingredients</SectionHeading>
            <ScaleControl scale={scale} onChange={setScale} className="mt-sm" />
            <IngredientList groups={recipe.ingredientGroups} ingredients={recipe.ingredients} scale={scale} />
          </section>
        </div>

        {/* Right column: Steps + Bakes */}
        <div className="tablet:col-span-4 desktop:col-span-8">
          <section aria-labelledby="steps-heading" className="mt-lg tablet:mt-0">
            <SectionHeading id="steps-heading">Steps</SectionHeading>
            {latestNote && (
              <Link
                href={`${logHref}?edit=${encodeURIComponent(recipe.bakeLog[0].id)}`}
                className="-mx-xs mt-sm flex min-h-touch-min items-center rounded-sm px-xs type-voice text-muted hover:underline focus-visible:outline-offset-2"
              >
                Last time: {latestNote}
              </Link>
            )}
            <StepList groups={recipe.stepGroups} steps={recipe.steps} />
          </section>

          <section aria-labelledby="bakes-heading" className="mt-lg desktop:mt-xl">
            <SectionHeading id="bakes-heading">Bakes</SectionHeading>
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

      {/* Action bar (mobile and tablet): both actions live in the record card on desktop instead. */}
      <div
        data-action-bar
        data-action-bar-tablet
        className="z-20 flex pin-bottom gap-sm bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar desktop:hidden"
      >
        <ButtonLink href={`${logHref}?new=1`} variant="secondary">
          Log bake
        </ButtonLink>
        <ButtonLink href={bakeHref} variant="primary" className="flex-1">
          Start baking{scale !== 1 && <span className="tabular-nums"> · {formatScale(scale)}</span>}
        </ButtonLink>
      </div>

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} shareLink={recipe.shareLink} onCreate={actions.createShareLink} onRevoke={actions.revokeShareLink} />
    </>
  );
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
