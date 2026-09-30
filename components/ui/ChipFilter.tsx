import { X } from "lucide-react";

// SKIN chip-filter: cobalt wash pill; the whole chip removes the filter, and its
// hit area is 48px tall (::before extends the 36px chip).

export function ChipFilter({ label, spoken, onRemove }: { label: string; spoken?: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${spoken ?? label}`}
      className="relative inline-flex min-h-[36px] items-center gap-xs rounded-full bg-primary-wash pr-sm pl-md type-caption font-bold text-primary transition-colors duration-(--motion-fast) ease-skin before:absolute before:inset-x-0 before:-inset-y-[6px] before:content-[''] hover:bg-primary hover:text-on-primary active:bg-primary-active active:text-on-primary focus-visible:outline-offset-2"
    >
      {label}
      <X aria-hidden="true" className="size-icon-sm" strokeWidth={2.2} />
    </button>
  );
}
