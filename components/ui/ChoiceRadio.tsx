import { cx } from "./cx";

export interface ChoiceRadioOption {
  value: string;
  label: string;
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
}: {
  legend: string;
  name: string;
  options: ChoiceRadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <fieldset className={cx("flex flex-wrap gap-x-lg gap-y-sm", className)}>
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
              className="absolute inset-0 opacity-0"
            />
            <span aria-hidden="true" className={cx("type-amount", checked ? "text-primary" : "text-muted")}>
              {checked ? "(●)" : "( )"}
            </span>
            <span className={cx("type-tab", checked ? "text-ink" : "text-muted group-hover:text-ink")}>{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
