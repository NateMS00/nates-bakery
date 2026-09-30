"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";

// BONES Search: visible label "Search", placeholder "Recipe or ingredient", a clear
// control once it has text; results update after a short pause and write ?q=.
// SKIN input: the label stays visible (never placeholder-only).

const PAUSE_MS = 300;

/** `trailing` sits beside the field box, under the full-width label (the mobile Filters button). */
export function SearchField({ initial, onSearch, trailing }: { initial: string; onSearch: (q: string) => void; trailing?: ReactNode }) {
  const [text, setText] = useState(initial);
  const timer = useRef<number | undefined>(undefined);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function change(value: string) {
    setText(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onSearch(value.trim()), PAUSE_MS);
  }

  function clear() {
    window.clearTimeout(timer.current);
    setText("");
    onSearch("");
    input.current?.focus();
  }

  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <label htmlFor="library-search" className="type-label text-muted">
        Search
      </label>
      <div className="flex items-stretch gap-sm">
        {/* The 48px field box is the target; a tap on its padding focuses the input. */}
        <div
          onClick={(e) => e.target === e.currentTarget && input.current?.focus()}
          className="flex min-h-control-height min-w-0 flex-1 items-center rounded-md border border-border bg-surface-card text-ink transition-colors duration-(--motion-fast) ease-skin hover:border-ink focus-within:border-primary focus-within:outline-3 focus-within:outline-offset-1 focus-within:outline-focus-ring"
        >
          <Search aria-hidden="true" className="ml-md size-icon-sm shrink-0 text-muted" strokeWidth={2} />
          <input
            ref={input}
            id="library-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Recipe or ingredient"
            value={text}
            onChange={(e) => change(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.clearTimeout(timer.current);
                onSearch(text.trim());
              }
            }}
            className="min-w-0 flex-1 self-stretch bg-transparent px-sm type-body-md outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none"
          />
          {text && (
            <IconButton label="Clear search" onClick={clear} className="-my-px">
              <X aria-hidden="true" strokeWidth={1.8} />
            </IconButton>
          )}
        </div>
        {trailing}
      </div>
    </div>
  );
}
