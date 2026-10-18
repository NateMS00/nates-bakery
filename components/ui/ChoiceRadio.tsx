import { cx } from "./cx";

export interface ChoiceRadioOption {
  value: string;
  label: string;
  /** Overrides the accessible name when the visible label doesn't read well aloud ("½×" → "Half"). */
  ariaLabel?: string;
}

/**
 * SKIN choice-radio: a typographic single choice, from the catalogue look:
 * "( ) 1×  (●) 1.5×". A real, visually hidden `<input type="radio">` per option
 * (never display:none — the label's native click-forwarding is what makes the
 * whole 48px row the target, which only works with a real form control inside
 * it), grouped in a fieldset with a legend. The glyph is decorative: the
 * selected option already reads as selected from its own radio state.
 */
export function ChoiceRadio({
  legend,
  name,
  options,
  value,
  onChange,
  className,
  children,
}: {
  legend: string;
  name: string;
  options: ChoiceRadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Trailing content in the same wrapping row as the options (Scale's Custom field). */
  children?: React.ReactNode;
}) {
  return (
    <fieldset className={cx("flex flex-wrap items-center gap-x-lg gap-y-sm", className)}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className="group relative flex min-h-touch-min cursor-pointer items-center gap-sm rounded-sm has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              aria-label={option.ariaLabel}
              // size-full, not just inset-0: a native radio is a replaced element with
              // its own intrinsic size, which WebKit keeps even when absolutely
              // positioned with every inset at 0 — only an explicit 100%/100% reliably
              // stretches it to the label's full hit area in every engine.
              className="absolute inset-0 size-full opacity-0"
            />
            <span aria-hidden="true" className={cx("type-amount", checked ? "text-primary" : "text-muted")}>
              {checked ? "(●)" : "( )"}
            </span>
            <span className={cx("type-tab", checked ? "text-ink" : "text-muted group-hover:text-ink")}>{option.label}</span>
          </label>
        );
      })}
      {children}
    </fieldset>
  );
}
