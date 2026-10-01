"use client";

import { useEffect, useRef } from "react";
import { Notice } from "@/components/ui/Notice";

/** A form-level error (SKIN notice-error) that takes focus when it appears, so it's read out. */
export function FormError({ children, version }: { children: string; version: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [version]);
  return (
    <div ref={ref} tabIndex={-1} className="rounded-md outline-offset-2">
      <Notice tone="error">{children}</Notice>
    </div>
  );
}
