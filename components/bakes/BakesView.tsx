"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BakeRow } from "@/components/ui/BakeRow";
import { BakeTile } from "@/components/ui/BakeTile";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { TextLink } from "@/components/ui/TextLink";
import { TilePanel } from "@/components/ui/Tile";
import { diarySummary, groupDiaryByMonth, type DiaryEntry } from "@/lib/data/bakeDiary";
import { bakeCount, bakeOrdinalLabel } from "@/lib/data/bakeLog";
import { formatMonthHeading, formatScale, formatShortDate, formatTileDate } from "@/lib/format";

// /bakes (Bakes diary), BONES-bakes.md 1.1.0. A reading page: no primary action,
// since logging a bake happens from a recipe (BONES Assumptions). Months stacked
// newest first, each a Fraunces chapter title over an ink rule; within a month,
// bakes with a photo form a bake-tile grid, a bake without one breaks it with a
// full-width bake-row, and the grid resumes after (BONES: tiles and rows keep date
// order between them). 40 bakes, then Show more loads older ones below.

const PAGE = 40;

export function BakesView({ diary }: { diary: DiaryEntry[] }) {
  const [shown, setShown] = useState(PAGE);
  const list = useRef<HTMLDivElement>(null);

  if (diary.length === 0) return <EmptyState />;

  function showMore() {
    const firstNewId = diary[shown]?.entry.id;
    setShown((n) => n + PAGE);
    if (firstNewId) {
      requestAnimationFrame(() => {
        list.current?.querySelector<HTMLElement>(`[data-entry="${firstNewId}"] a`)?.focus();
      });
    }
  }

  const summary = diarySummary(diary);
  const months = groupDiaryByMonth(diary.slice(0, shown));

  return (
    <div>
      <div className="flex flex-col items-start">
        <DisplayTitle lead="Your" accent="bakes." />
        <p className="mt-xs type-body-sm text-muted">
          {bakeCount(summary.count)} this year · {summary.recipes} {summary.recipes === 1 ? "recipe" : "recipes"}
        </p>
      </div>

      <div ref={list} className="mt-lg flex flex-col gap-2xl desktop:mt-xl desktop:gap-section">
        {months.map((group) => (
          <section key={group.key} aria-labelledby={`month-${group.key}`}>
            <div className="flex items-baseline justify-between gap-base border-b border-primary pb-sm">
              <h2 id={`month-${group.key}`} className="type-display-md text-ink desktop:type-display-lg">
                {formatMonthHeading(group.year, group.month)}
              </h2>
              <p className="type-label-mono text-muted">{bakeCount(group.entries.length)}</p>
            </div>
            <div className="mt-base flex flex-col gap-base">
              {group.blocks.map((block, i) =>
                block.kind === "row" ? (
                  <div key={block.item.entry.id} data-entry={block.item.entry.id}>
                    <BakeRow
                      href={`/recipes/${block.item.recipeId}/log?edit=${encodeURIComponent(block.item.entry.id)}`}
                      recipeTitle={block.item.recipeTitle}
                      date={formatShortDate(block.item.entry.date)}
                      note={block.item.entry.howItTurnedOut || block.item.entry.whatChanged || null}
                      rating={block.item.entry.rating}
                    />
                  </div>
                ) : (
                  <ul key={i} role="list" className="grid grid-cols-2 gap-x-md gap-y-base tablet:grid-cols-3 desktop:grid-cols-4">
                    {block.items.map((diaryEntry) => {
                      const { day, weekday } = formatTileDate(diaryEntry.entry.date);
                      return (
                        <li key={diaryEntry.entry.id} data-entry={diaryEntry.entry.id}>
                          <BakeTile
                            href={`/recipes/${diaryEntry.recipeId}/log?edit=${encodeURIComponent(diaryEntry.entry.id)}`}
                            picture={diaryEntry.entry.photo ?? null}
                            day={day}
                            weekday={weekday}
                            title={diaryEntry.recipeTitle}
                            rating={diaryEntry.entry.rating}
                            bakeLabel={bakeOrdinalLabel(diaryEntry.ordinal) ?? (diaryEntry.entry.scale !== 1 ? formatScale(diaryEntry.entry.scale) : null)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      {diary.length > shown && (
        <Button variant="text" onClick={showMore} className="mt-lg -ml-sm">
          Show more
        </Button>
      )}
    </div>
  );
}

/** BONES Empty: no bakes logged yet. */
function EmptyState() {
  return (
    <div className="mx-auto mt-lg flex flex-col items-center text-center tablet:max-w-[calc(var(--col)*4+var(--gutter)*3)] desktop:mt-xl">
      {/* Nathan's empty-Bakes illustration stands in for TilePanel until it exists. */}
      <TilePanel className="w-full max-w-[calc(var(--spacing-3xl)*4)]" />
      <DisplayTitle lead="Nothing out of the oven" accent="yet." className="mt-lg" />
      <p className="mt-sm type-body-lg text-ink">Log a bake from any recipe and it shows up here, with its photo and how it went.</p>
      <TextLink href="/recipes" className="mt-lg inline-flex min-h-touch-min items-center type-body-md">
        Go to Library
      </TextLink>
    </div>
  );
}
