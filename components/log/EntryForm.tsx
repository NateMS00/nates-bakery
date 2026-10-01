"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmActions } from "@/components/ui/ConfirmDialog";
import { Dialog, type FocusTarget } from "@/components/ui/Dialog";
import { Notice } from "@/components/ui/Notice";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import type { BakeFields } from "@/lib/data/actions";
import { SCALE_MAX, SCALE_MIN, todayIso } from "@/lib/format";

// BONES Entry form: a full-screen sheet on mobile (two text fields and the keyboard
// don't fit a partial sheet), a 6-column modal from tablet up. Date, Scale, What
// changed, How it turned out; Save and Cancel pinned to the bottom. Focus starts on
// What changed. Closing with changes asks first, inside the form (Discard changes).

export type EntryValues = { date: string; scale: string; whatChanged: string; howItTurnedOut: string };

export function entryValues(fields: BakeFields): EntryValues {
  return {
    date: fields.date,
    scale: String(Math.round(fields.scale * 100) / 100),
    whatChanged: fields.whatChanged ?? "",
    howItTurnedOut: fields.howItTurnedOut ?? "",
  };
}

type Errors = Partial<Record<"date" | "scale", string>>;

function validate(v: EntryValues): { errors: Errors; fields?: BakeFields } {
  const errors: Errors = {};
  if (!v.date) errors.date = "Enter the day you baked it";
  else if (v.date > todayIso()) errors.date = "The date can't be in the future";
  const scale = Number(v.scale.trim().replace(",", "."));
  if (!v.scale.trim() || !Number.isFinite(scale) || scale < SCALE_MIN || scale > SCALE_MAX) {
    errors.scale = `Enter a scale from ${SCALE_MIN} to ${SCALE_MAX}, like 1.5`;
  }
  if (errors.date || errors.scale) return { errors };
  return { errors, fields: { date: v.date, scale, whatChanged: v.whatChanged, howItTurnedOut: v.howItTurnedOut } };
}

export function EntryForm({
  open,
  session,
  mode,
  initial,
  onSave,
  onClose,
  returnFocus,
  onAfterClose,
}: {
  open: boolean;
  /** Changes each time the form opens, so it starts from `initial` again. */
  session: number;
  mode: "new" | "edit";
  initial: EntryValues;
  /** Resolves false when the save didn't go through. */
  onSave: (fields: BakeFields) => Promise<boolean>;
  onClose: () => void;
  returnFocus?: FocusTarget;
  onAfterClose?: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [seen, setSeen] = useState(session);
  if (seen !== session) {
    setSeen(session);
    setValues(initial);
    setErrors({});
    setConfirming(false);
    setFailed(false);
  }

  const id = useId();
  const dateRef = useRef<HTMLInputElement>(null);
  const scaleRef = useRef<HTMLInputElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const firstNote = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (confirming) keepRef.current?.focus();
  }, [confirming]);

  const dirty = (Object.keys(initial) as (keyof EntryValues)[]).some((k) => values[k].trim() !== initial[k].trim());

  function requestClose() {
    if (busy) return;
    if (confirming) keepEditing();
    else if (dirty) setConfirming(true);
    else onClose();
  }

  function keepEditing() {
    setConfirming(false);
    // Back to where the writing was; What changed if focus had left the fields.
    requestAnimationFrame(() => firstNote.current?.focus());
  }

  const set = (k: keyof EntryValues) => (value: string) => {
    setValues((v) => ({ ...v, [k]: value }));
    if (k === "date" || k === "scale") setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const result = validate(values);
    setErrors(result.errors);
    if (!result.fields) {
      (result.errors.date ? dateRef : scaleRef).current?.focus();
      return;
    }
    setBusy(true);
    setFailed(false);
    const ok = await onSave(result.fields);
    setBusy(false);
    if (!ok) setFailed(true);
  }

  const formId = `${id}-form`;

  return (
    <Dialog
      open={open}
      onClose={requestClose}
      title={mode === "new" ? "Log a bake" : "Edit bake"}
      modalColumns={6}
      sheetHeight="full"
      returnFocus={returnFocus}
      onAfterClose={onAfterClose}
      footer={
        confirming ? (
          <div role="group" aria-labelledby={`${id}-discard`} aria-describedby={`${id}-discard-body`}>
            <p id={`${id}-discard`} className="type-heading text-ink">
              Discard this entry?
            </p>
            <p id={`${id}-discard-body`} className="mt-xs type-body-sm text-body">
              {mode === "new" ? "What you've written for this bake won't be saved." : "Your changes to this bake won't be saved."}
            </p>
            <ConfirmActions
              className="mt-base"
              confirm="Discard"
              cancel="Keep editing"
              autoFocusCancel={false}
              cancelRef={keepRef}
              onConfirm={onClose}
              onCancel={keepEditing}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-sm tablet:flex tablet:justify-end">
            <Button variant="secondary" onClick={requestClose}>
              Cancel
            </Button>
            <Button type="submit" form={formId} variant="primary" aria-busy={busy || undefined}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        )
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="flex flex-col gap-base pt-xs">
        {failed && <Notice tone="error">Couldn&apos;t save this bake. Check your connection and try again.</Notice>}
        <div className="grid grid-cols-2 gap-base">
          <TextField
            ref={dateRef}
            id={`${id}-date`}
            label="Date"
            type="date"
            required
            max={todayIso()}
            value={values.date}
            error={errors.date}
            onChange={(e) => set("date")(e.target.value)}
          />
          <TextField
            ref={scaleRef}
            id={`${id}-scale`}
            label="Scale"
            inputMode="decimal"
            autoComplete="off"
            amount
            suffix="×"
            value={values.scale}
            error={errors.scale}
            onChange={(e) => set("scale")(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor={`${id}-changed`} className="type-label text-muted">
            What changed
          </label>
          <Textarea
            ref={firstNote}
            id={`${id}-changed`}
            data-autofocus
            value={values.whatChanged}
            placeholder="Less sugar, hotter oven, longer proof…"
            onChange={(e) => set("whatChanged")(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor={`${id}-result`} className="type-label text-muted">
            How it turned out
          </label>
          <Textarea
            id={`${id}-result`}
            value={values.howItTurnedOut}
            placeholder="Crisp base, custard a little loose…"
            onChange={(e) => set("howItTurnedOut")(e.target.value)}
          />
        </div>
      </form>
    </Dialog>
  );
}
