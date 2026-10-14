"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, type FocusTarget } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";

// BONES-import-detail Ingredients: Add note / Edit note from an ingredient's row menu.
// A sheet on mobile, a modal from tablet up, with one field and Save. Saving it empty
// removes the note. Esc or the close X keeps the note as it was.

export const NOTE_MAX = 300;

export function NoteDialog({
  open,
  ingredientName,
  note,
  onSave,
  onClose,
  returnFocus,
}: {
  open: boolean;
  ingredientName: string;
  note: string | undefined;
  onSave: (note: string | undefined) => void;
  onClose: () => void;
  returnFocus: FocusTarget;
}) {
  const id = useId();
  const [value, setValue] = useState(note ?? "");
  const editing = Boolean(note);
  return (
    <Dialog open={open} onClose={onClose} title={editing ? "Edit note" : "Add note"} modalColumns={5} returnFocus={returnFocus}>
      <form
        className="flex flex-col gap-base pt-xs"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(value.trim() || undefined);
        }}
      >
        <div className="flex flex-col gap-xs">
          <label htmlFor={`${id}-note`} className="type-label text-muted">
            Note for {ingredientName}
          </label>
          <Textarea
            id={`${id}-note`}
            data-autofocus
            value={value}
            maxLength={NOTE_MAX}
            aria-describedby={`${id}-hint`}
            onChange={(e) => setValue(e.target.value)}
          />
          <p id={`${id}-hint`} className="type-body-sm text-muted">
            {editing ? "Up to 300 characters. Leave it empty to remove the note." : "Up to 300 characters, such as what the creator said about it."}
          </p>
        </div>
        <Button type="submit" variant="primary" className="w-full tablet:w-auto tablet:self-end">
          Save note
        </Button>
      </form>
    </Dialog>
  );
}
