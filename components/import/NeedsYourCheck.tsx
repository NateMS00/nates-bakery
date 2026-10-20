"use client";

import { Check, ChevronRight } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EstimatedMarker, MissingMarker } from "@/components/ui/Marker";
import { Notice } from "@/components/ui/Notice";
import { textLinkClass } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { amountFieldId, checkItems, saveStatus, type CheckItem, type EditorState, type Problem } from "@/lib/data/editor";
import { formatGrams } from "@/lib/format";

// BONES-import-detail 1.6.0 Needs Your Check: heading "Check 6 amounts" with a big
// outlined countdown numeral beside it (decorative; turns into a solid cobalt check
// at zero), "Tap a row to fix it." under it, then Missing rows (jump to the field;
// no check control, can't be confirmed without a number), then a check-row each for
// Estimated and Converted (a round check control confirms in place; the rest of the
// row jumps to the field), "These look right" to confirm every Estimated/Converted
// row at once, at most 5 rows on mobile then Show n more. A confirmed row stays in
// place until the page next opens; Missing rows leave as soon as they're resolved.

const MOBILE_LIMIT = 5;

export function jumpTo(fieldId: string) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  field.focus({ preventScroll: true });
}

function key(item: CheckItem) {
  return `${item.kind}:${item.ingredient.id}`;
}

function value(item: CheckItem) {
  const grams = Number(item.ingredient.amount.replace(",", "."));
  if (item.kind === "missing") return "— g";
  const g = `${Number.isFinite(grams) ? formatGrams(grams) : item.ingredient.amount} g`;
  return item.kind === "converted" && item.ingredient.original ? `${g} from ${item.ingredient.original}` : g;
}

/** SKIN: the count also drawn as a big outlined numeral, a solid cobalt check at zero. */
function CountNumeral({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span aria-hidden="true" className="grid size-[64px] shrink-0 place-items-center text-primary">
        <Check className="size-icon" strokeWidth={3} />
      </span>
    );
  }
  return (
    <p aria-hidden="true" className="shrink-0 font-[family-name:var(--font-fraunces-bake-number)] text-[64px] leading-none font-black text-transparent tabular-nums [-webkit-text-stroke:var(--spacing-outline-text)_var(--color-ink)]">
      {String(count).padStart(2, "0")}
    </p>
  );
}

export function NeedsYourCheck({
  state,
  setState,
  problems,
  summaryRef,
  incomplete,
}: {
  state: EditorState;
  setState: (updater: (s: EditorState) => EditorState) => void;
  problems: Problem[] | null;
  summaryRef: React.RefObject<HTMLDivElement | null>;
  /** "Couldn't finish" (BONES-import-detail): the Shortcut never read the recipe.
   * "retrying": Retry was tapped and the Shortcut hasn't answered yet. */
  incomplete?: { kind: "failed"; onRetry: () => void } | { kind: "retrying"; onTryAgain: () => void };
}) {
  // Estimated/Converted rows confirmed this session stay in place (BONES: "stays in
  // place... rows leave when the page next opens"), so what's rendered is fixed to
  // what existed at mount, re-read live from state for its current name/amount/status.
  const [snapshot] = useState(() => checkItems(state).filter((i) => i.kind !== "missing").map(key));
  const byId = new Map(state.ingredients.map((i) => [i.id, i]));
  const flagged: CheckItem[] = snapshot.flatMap((k) => {
    const [kind, id] = k.split(/:(.+)/) as ["estimated" | "converted", string];
    const ingredient = byId.get(id);
    return ingredient ? [{ kind, ingredient }] : [];
  });
  const missingItems = checkItems(state).filter((i) => i.kind === "missing");
  const unconfirmedFlagged = flagged.filter((r) => r.ingredient.status !== "confirmed");
  const items: CheckItem[] = [...missingItems, ...flagged];
  const openCount = missingItems.length + unconfirmedFlagged.length;
  const [expanded, setExpanded] = useState(false);

  function confirm(id: string) {
    setState((s) => ({ ...s, ingredients: s.ingredients.map((i) => (i.id === id ? { ...i, status: "confirmed" } : i)) }));
  }
  function confirmAll() {
    const ids = new Set(unconfirmedFlagged.map((r) => r.ingredient.id));
    setState((s) => ({ ...s, ingredients: s.ingredients.map((i) => (ids.has(i.id) ? { ...i, status: "confirmed" } : i)) }));
  }

  // Announce resolved/confirmed items without moving focus (BONES: "Flour confirmed.
  // 5 left"; a bulk confirm as "4 amounts confirmed").
  const live = useRef<HTMLParagraphElement>(null);
  const previousConfirmedIds = useRef(new Set(flagged.filter((r) => r.ingredient.status === "confirmed").map((r) => r.ingredient.id)));
  const previousMissingIds = useRef(new Set(missingItems.map((i) => i.ingredient.id)));
  useEffect(() => {
    const nowConfirmedIds = new Set(flagged.filter((r) => r.ingredient.status === "confirmed").map((r) => r.ingredient.id));
    const newlyConfirmed = [...nowConfirmedIds].filter((id) => !previousConfirmedIds.current.has(id));
    const nowMissingIds = new Set(missingItems.map((i) => i.ingredient.id));
    const resolvedMissing = [...previousMissingIds.current].filter((id) => !nowMissingIds.has(id));
    if (live.current) {
      if (newlyConfirmed.length > 1) {
        live.current.textContent = `${newlyConfirmed.length} amounts confirmed.`;
      } else if (newlyConfirmed.length === 1) {
        const name = byId.get(newlyConfirmed[0])?.name.trim() || "Ingredient";
        live.current.textContent = `${name} confirmed. ${openCount} left.`;
      } else if (resolvedMissing.length === 1) {
        const name = byId.get(resolvedMissing[0])?.name.trim() || "Ingredient";
        live.current.textContent = `${name} checked. ${openCount} left.`;
      }
    }
    previousConfirmedIds.current = nowConfirmedIds;
    previousMissingIds.current = nowMissingIds;
  });

  if (incomplete?.kind === "retrying") {
    return (
      <section aria-labelledby="check-heading">
        <h2 id="check-heading" className="type-heading text-ink">
          Check amounts
        </h2>
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
        <h2 id="check-heading" className="type-heading text-ink">
          Check amounts
        </h2>
        <Notice tone="error" className="mt-sm" action={<Button variant="text" onClick={incomplete.onRetry} className="-my-md -ml-sm">Retry</Button>}>
          This import didn&rsquo;t finish reading the recipe.
        </Notice>
      </section>
    );
  }

  return (
    <section aria-labelledby="check-heading">
      {problems && problems.length > 0 && <ErrorSummary ref={summaryRef} problems={problems} />}
      {items.length === 0 ? (
        <div className="flex items-center gap-base">
          <CountNumeral count={0} />
          <h2 id="check-heading" className="type-heading text-ink">
            Everything checked
          </h2>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-base">
            <CountNumeral count={openCount} />
            <div>
              <h2 id="check-heading" className="type-heading text-ink">
                {openCount === 0 ? "Everything checked" : `Check ${openCount} ${openCount === 1 ? "amount" : "amounts"}`}
              </h2>
              <p className="mt-xs type-body-sm text-muted">Tap a row to fix it.</p>
            </div>
          </div>
          <ul role="list" className="mt-sm">
            {items.map((item, i) => (
              <li key={key(item)} className={cx(!expanded && i >= MOBILE_LIMIT && "max-tablet:hidden")}>
                {item.kind === "missing" ? (
                  <a
                    href={`#${amountFieldId(item.ingredient.id)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      jumpTo(amountFieldId(item.ingredient.id));
                    }}
                    className="grid min-h-touch-min grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-sm rounded-sm border-b border-outline py-xs text-ink hover:text-primary hover:underline focus-visible:outline-offset-2"
                  >
                    <MissingMarker />
                    <span className="truncate type-body-md">{item.ingredient.name.trim() || "Unnamed ingredient"}</span>
                    <span className="text-right type-body-sm text-muted tabular-nums">{value(item)}</span>
                    <ChevronRight aria-hidden="true" className="size-icon-sm text-muted" />
                  </a>
                ) : (
                  <CheckRow item={item} confirmed={item.ingredient.status === "confirmed"} onConfirm={() => confirm(item.ingredient.id)} />
                )}
              </li>
            ))}
          </ul>
          {items.length > MOBILE_LIMIT && !expanded && (
            <Button variant="text" onClick={() => setExpanded(true)} className="-ml-sm tablet:hidden">
              Show {items.length - MOBILE_LIMIT} more
            </Button>
          )}
          {unconfirmedFlagged.length > 0 && (
            <Button variant="secondary" onClick={confirmAll} className="mt-sm w-full">
              <Check aria-hidden="true" className="size-icon-sm" strokeWidth={3} />
              These look right
            </Button>
          )}
        </>
      )}
      <p ref={live} role="status" className="sr-only" />
    </section>
  );
}

function CheckRow({
  item,
  confirmed,
  onConfirm,
}: {
  item: CheckItem;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  const name = item.ingredient.name.trim() || "Unnamed ingredient";
  const fieldId = amountFieldId(item.ingredient.id);
  const amountText = (() => {
    const grams = Number(item.ingredient.amount.replace(",", "."));
    return `${Number.isFinite(grams) ? formatGrams(grams) : item.ingredient.amount} g`;
  })();
  return (
    <div className="flex items-start gap-md border-b border-outline py-md">
      <button
        type="button"
        role="checkbox"
        aria-checked={confirmed}
        aria-label={`Confirm ${name}, ${amountText}`}
        onClick={onConfirm}
        className={cx(
          // The circle itself is checkSize (24px); the hit area still meets 48px via
          // a centered ::before, the same technique as a native checkbox's own box.
          "relative mt-[1px] grid size-icon shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-(--motion-fast) ease-skin before:absolute before:-inset-md before:content-[''] focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring",
          confirmed ? "border-success bg-success text-on-primary" : "border-border text-transparent hover:border-ink",
        )}
      >
        <Check className="size-icon-sm" strokeWidth={3} />
      </button>
      <a
        href={`#${fieldId}`}
        onClick={(e) => {
          e.preventDefault();
          jumpTo(fieldId);
        }}
        className="flex min-h-touch-min min-w-0 flex-1 items-center gap-sm rounded-sm text-ink hover:text-primary hover:underline focus-visible:outline-offset-2"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-xs type-body-md">
            {name}
            {item.kind === "estimated" && <EstimatedMarker spoken="estimated" />}
          </span>
          {item.ingredient.original && <span className="block type-caption text-muted">from {item.ingredient.original}</span>}
        </span>
        <span className="shrink-0 text-right type-amount text-ink tabular-nums">{amountText}</span>
        <ChevronRight aria-hidden="true" className="size-icon-sm shrink-0 text-muted" />
      </a>
    </div>
  );
}

/** BONES Save blocked: each problem as a link to its field. Takes focus when shown. */
export const ErrorSummary = forwardRef<HTMLDivElement, { problems: Problem[] }>(function ErrorSummary({ problems }, ref) {
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby="save-blocked-heading" className="mb-sm scroll-mt-lg rounded-md border-l-4 border-error bg-error-wash px-base py-md text-ink focus-visible:outline-offset-2">
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
