import { Check, ChevronRight } from "lucide-react";
import { formatGrams } from "@/lib/format";
import { MissingMarker } from "./Marker";
import { cx } from "./cx";

/**
 * SKIN check-row: one Estimated, Converted, or Missing amount to check on Review
 * Import. Two separate targets with separate names: the round check control
 * confirms the amount in place (olive filled check once confirmed — never colour
 * alone, the icon's shape changes too, and its label says "Confirmed" or "Confirm
 * <name>, <amount>"); the rest of the row jumps to the field in the editor. A
 * Missing row swaps the check control for the `marker-missing` tag, since it
 * can't be confirmed until it has a number.
 */
export function CheckRow({
  name,
  original,
  grams,
  status,
  confirmed,
  onConfirm,
  onJump,
}: {
  name: string;
  /** "from 3 cups", shown under the name until confirmed. */
  original: string;
  /** null for Missing (shown as "—", hidden from screen readers, which hear "no amount"). */
  grams: number | null;
  status: "estimated" | "converted" | "missing";
  confirmed: boolean;
  onConfirm?: () => void;
  onJump: () => void;
}) {
  const amountLabel = grams === null ? "no amount" : `${formatGrams(grams)} g`;
  return (
    <div className="flex items-center gap-md border-b border-outline py-md">
      {status === "missing" ? (
        <MissingMarker />
      ) : (
        <button
          type="button"
          aria-pressed={confirmed}
          onClick={onConfirm}
          aria-label={confirmed ? `${name}, confirmed` : `Confirm ${name}, ${amountLabel}`}
          className={cx(
            "relative inline-grid size-icon shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-(--motion-fast) ease-skin before:absolute before:-inset-[12px] before:content-[''] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
            confirmed ? "border-success bg-success text-on-primary" : "border-border bg-transparent hover:border-ink",
          )}
        >
          {confirmed && <Check aria-hidden="true" className="size-icon-sm" strokeWidth={3} />}
        </button>
      )}
      <button
        type="button"
        onClick={onJump}
        className="flex min-h-touch-min min-w-0 flex-1 items-center gap-md rounded-sm text-left transition-colors duration-(--motion-fast) ease-skin hover:bg-surface-sunken active:bg-primary-wash focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring"
      >
        <span className="min-w-0 flex-1">
          <span className="block type-body-md text-ink">{name}</span>
          {!confirmed && status !== "missing" && (
            <span className="block type-caption text-muted">
              {status === "estimated" && <span className="font-bold">~ Est. </span>}
              {original}
            </span>
          )}
        </span>
        <span className="shrink-0 whitespace-nowrap text-right">
          {grams === null ? (
            <span className="type-amount text-ink">
              <span aria-hidden="true">—</span>
              <span className="sr-only">No amount</span>
            </span>
          ) : (
            <span className="type-amount text-ink">{formatGrams(grams)}</span>
          )}
          <span className="ml-[3px] type-body-md text-muted">g</span>
        </span>
        <ChevronRight aria-hidden="true" className="size-icon-sm shrink-0 text-muted" />
      </button>
    </div>
  );
}
