import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

/** SKIN inline-confirmation: olive wash, olive check, announced politely. */
export function InlineConfirmation({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="status" className={cx("flex flex-wrap items-center gap-x-sm rounded-md bg-success-wash px-md py-sm type-body-sm text-ink animate-[fade-in_var(--motion-base)_var(--ease-skin)]", className)}>
      <Check aria-hidden="true" className="size-icon-sm shrink-0 text-success" strokeWidth={2.5} />
      {children}
    </div>
  );
}
