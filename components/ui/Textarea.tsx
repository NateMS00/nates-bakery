"use client";

import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { cx } from "./cx";

// SKIN textarea: like input, at least 96px tall and growing with its content.

export function Textarea({ className, value, error, ...props }: ComponentProps<"textarea"> & { error?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      rows={3}
      className={cx(
        "block min-h-[96px] w-full resize-none overflow-hidden rounded-md border border-border bg-surface-card px-base py-md type-body-md text-ink placeholder:text-muted transition-colors duration-(--motion-fast) ease-skin hover:border-ink focus-visible:border-primary focus-visible:outline-offset-1",
        error && "border-2 border-error hover:border-error",
        className,
      )}
      {...props}
    />
  );
}
