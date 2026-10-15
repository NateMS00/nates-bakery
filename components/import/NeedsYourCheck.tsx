"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EstimatedMarker, ConvertedLabel, MissingMarker } from "@/components/ui/Marker";
import { Notice } from "@/components/ui/Notice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { textLinkClass } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { amountFieldId, checkItems, saveStatus, type CheckItem, type EditorState, type Problem } from "@/lib/data/editor";
import { formatGrams } from "@/lib/format";

// BONES Needs Your Check: a summary ("2 missing · 3 estimated · 1 converted"), then
// Missing, Estimated, Converted items; each jumps to its field and focuses it. At most
// 5 items on mobile, then Show all (n); desktop shows all. Items leave as they're
// resolved, announced to screen readers. With a blocked save, an error summary sits at
// the top and takes focus.

const MOBILE_LIMIT = 5;

export function jumpTo(fieldId: string) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  field.focus({ preventScroll: true });
}

function value(item: CheckItem) {
  const grams = Number(item.ingredient.amount.replace(",", "."));
  if (item.kind === "missing") return "— g";
  const g = `${Number.isFinite(grams) ? formatGrams(grams) : item.ingredient.amount} g`;
  return item.kind === "converted" && item.ingredient.original ? `${g} from ${item.ingredient.original}` : g;
}

export function NeedsYourCheck({
  state,
  problems,
  summaryRef,
  incomplete,
}: {
  state: EditorState;
  problems: Problem[] | null;
  summaryRef: React.RefObject<HTMLDivElement | null>;
  /** "Couldn't finish" (BONES-import-detail): the Shortcut never read the recipe.
   * "retrying": Retry was tapped and the Shortcut hasn't answered yet. */
  incomplete?: { kind: "failed"; onRetry: () => void } | { kind: "retrying"; onTryAgain: () => void };
}) {
  const items = checkItems(state);
  const [expanded, setExpanded] = useState(false);
  const counts = { missing: 0, estimated: 0, converted: 0 };
  items.forEach((i) => counts[i.kind]++);
  const summary = [counts.missing && `${counts.missing} missing`, counts.estimated && `${counts.estimated} estimated`, counts.converted && `${counts.converted} converted`]
    .filter(Boolean)
    .join(" · ");

  // Announce resolved items ("Butter checked. 5 left to check.") without moving focus.
  const live = useRef<HTMLParagraphElement>(null);
  const previous = useRef(items);
  useEffect(() => {
    const now = new Set(items.map((i) => `${i.kind}:${i.ingredient.id}`));
    const gone = previous.current.filter((i) => !now.has(`${i.kind}:${i.ingredient.id}`));
    if (gone.length && live.current) {
      const left = items.length ? `${items.length} left to check.` : "Everything checked.";
      live.current.textContent = `${gone.map((g) => g.ingredient.name.trim() || "Ingredient").join(", ")} checked. ${left}`;
    }
    previous.current = items;
  });

  if (incomplete?.kind === "retrying") {
    return (
      <section aria-labelledby="check-heading">
        <SectionHeading id="check-heading">Needs your check</SectionHeading>
        <div className="mt-sm">
          <div className="flex items-center gap-sm">
            <span aria-hidden="true" className="size-icon-sm shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none" />
            <p role="status" className="type-body-md text-ink">
              Retrying in the Shortcut
            </p>
          </div>
          <p className="mt-xs type-body-sm text-muted">Reading the recipe, converting to grams.</p>
          <p className="mt-base type-body-sm text-muted">
            Didn&rsquo;t start?{" "}
            <button type="button" onClick={incomplete.onTryAgain} className={cx(textLinkClass, "inline-flex min-h-touch-min items-center")}>
              Try again
            </button>
          </p>
        </div>
      </section>
    );
  }

  if (incomplete?.kind === "failed") {
    return (
      <section aria-labelledby="check-heading">
        <SectionHeading id="check-heading">Needs your check</SectionHeading>
        <Notice tone="error" className="mt-sm" action={<Button variant="text" onClick={incomplete.onRetry} className="-my-md -ml-sm">Retry</Button>}>
          This import didn&rsquo;t finish reading the recipe.
        </Notice>
      </section>
    );
  }

  return (
    <section aria-labelledby="check-heading">
      <SectionHeading id="check-heading">Needs your check</SectionHeading>
      {problems && problems.length > 0 && <ErrorSummary ref={summaryRef} problems={problems} />}
      {items.length === 0 ? (
        <Notice tone="info" className="mt-sm">
          Everything checked
        </Notice>
      ) : (
        <>
          <p className="mt-sm type-body-sm text-muted">{summary}</p>
          <ul role="list" className="mt-xs">
            {items.map((item, i) => (
              <li key={`${item.kind}-${item.ingredient.id}`} className={cx("border-b border-hairline last:border-b-0", !expanded && i >= MOBILE_LIMIT && "max-tablet:hidden")}>
                <a
                  href={`#${amountFieldId(item.ingredient.id)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    jumpTo(amountFieldId(item.ingredient.id));
                  }}
                  className="grid min-h-touch-min grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-sm rounded-sm py-xs text-ink hover:text-primary hover:underline focus-visible:outline-offset-2"
                >
                  {item.kind === "missing" ? <MissingMarker /> : item.kind === "estimated" ? <EstimatedMarker /> : <ConvertedLabel />}
                  <span className="truncate type-body-md">{item.ingredient.name.trim() || "Unnamed ingredient"}</span>
                  <span className="text-right type-body-sm text-muted tabular-nums">{value(item)}</span>
                </a>
              </li>
            ))}
          </ul>
          {items.length > MOBILE_LIMIT && !expanded && (
            <Button variant="text" onClick={() => setExpanded(true)} className="-ml-sm tablet:hidden">
              Show all ({items.length})
            </Button>
          )}
        </>
      )}
      <p ref={live} role="status" className="sr-only" />
    </section>
  );
}

/** BONES Save blocked: each problem as a link to its field. Takes focus when shown. */
export const ErrorSummary = forwardRef<HTMLDivElement, { problems: Problem[] }>(function ErrorSummary({ problems }, ref) {
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby="save-blocked-heading" className="mt-sm scroll-mt-lg rounded-md border-l-4 border-error bg-error-wash px-base py-md text-ink focus-visible:outline-offset-2">
      <p id="save-blocked-heading" className="type-body-md font-bold">
        {saveStatus(problems.length)} before saving
      </p>
      <ul role="list" className="mt-xs">
        {problems.map((p) => (
          <li key={p.fieldId}>
            <a
              href={`#${p.fieldId}`}
              onClick={(e) => {
                e.preventDefault();
                jumpTo(p.fieldId);
              }}
              className="inline-flex min-h-touch-min items-center rounded-sm type-body-sm text-primary underline decoration-1 underline-offset-3 hover:decoration-2 focus-visible:outline-offset-2"
            >
              {p.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
