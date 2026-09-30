"use client";

import { Plus } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Popover } from "@/components/ui/Popover";
import { TextField } from "@/components/ui/TextField";
import { TABLET_UP, useMediaQuery } from "@/components/ui/useMediaQuery";

// BONES Group picker: Add ingredient group / Add step group. Mobile: a bottom sheet
// with a name field on top and the suggested names below, grouped; desktop: a panel
// under the button with the same suggestions. A suggestion or a new name adds the
// group at the end.

export function GroupPicker({
  buttonLabel,
  title,
  suggestions,
  existing,
  onAdd,
}: {
  buttonLabel: string;
  title: string;
  suggestions: { label: string; names: string[] }[];
  existing: string[];
  onAdd: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  const desktop = useMediaQuery(TABLET_UP);
  const titleId = useId();
  const taken = new Set(existing.map((n) => n.toLowerCase()));

  function add(value: string) {
    if (!value.trim()) return;
    setOpen(false);
    setName("");
    onAdd(value.trim());
  }

  const body = (
    <div className="flex flex-col gap-base">
      <form
        className="flex items-end gap-sm"
        onSubmit={(e) => {
          e.preventDefault();
          add(name);
        }}
      >
        <TextField id={`${titleId}-name`} label="Group name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" wrapperClassName="flex-1" data-autofocus />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>
      {suggestions.map((section) => (
        <div key={section.label} className="flex flex-col gap-xs">
          <span className="type-label text-muted">{section.label}</span>
          <div className="flex flex-wrap gap-sm">
            {section.names
              .filter((n) => !taken.has(n.toLowerCase()))
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => add(n)}
                  className="inline-flex min-h-touch-min items-center rounded-md border border-border bg-surface-card px-base type-body-sm font-bold text-ink transition-colors duration-(--motion-fast) ease-skin hover:border-ink hover:bg-surface-sunken focus-visible:outline-offset-2"
                >
                  {n}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative">
      <Button ref={button} variant="text" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="-ml-sm">
        <Plus aria-hidden="true" />
        {buttonLabel}
      </Button>
      {desktop ? (
        <Popover open={open} onClose={() => setOpen(false)} anchor={button} labelledBy={titleId} className="w-[calc(var(--col)*4+var(--gutter)*3)] max-w-[90vw] p-base">
          <h4 id={titleId} className="mb-sm type-heading text-ink">
            {title}
          </h4>
          {body}
        </Popover>
      ) : (
        <Dialog open={open} onClose={() => setOpen(false)} title={title} modalColumns={5} returnFocus={button}>
          <div className="pt-xs">{body}</div>
        </Dialog>
      )}
    </div>
  );
}
