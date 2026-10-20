"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmActions } from "@/components/ui/ConfirmDialog";
import { Dialog, type FocusTarget } from "@/components/ui/Dialog";
import { Notice } from "@/components/ui/Notice";
import { StarRating } from "@/components/ui/StarRating";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import type { BakeFields } from "@/lib/data/actions";
import { deleteBakePhoto, uploadBakePhoto } from "@/lib/data/actions";
import { SCALE_MAX, SCALE_MIN, todayIso } from "@/lib/format";
import { resizeToJpeg } from "@/lib/photo-resize";
import { BakedOnField } from "./BakedOnField";
import { PhotoField } from "./PhotoField";

// BONES-recipes-log.md, the Log sheet: a full-screen sheet on mobile (two text
// fields and the keyboard don't fit a partial sheet), a 6-column modal from
// tablet up. "Baked on" and Scale as one row of compact controls, then the five
// stars (optional, at the Log sheet's larger size), How it turned out, What
// changed, then the photo slot. Save only, full width, with "Only the date is
// required." under it — there's no Cancel button, the close X cancels. Focus
// starts on the first star for a new bake and on How it turned out when
// editing. Closing with changes asks first, inside the form (Discard changes).
//
// The photo slot uploads as soon as it's picked (resized client-side to a JPEG,
// lib/photo-resize.ts), ahead of Save — Save only waits on it if it's still in
// flight. `photo` (the resolved display URL, for an existing entry's preview)
// is an input here only to seed the form; it's never sent back.
export type EntryValues = {
  date: string;
  scale: string;
  rating: number | null;
  photoPath: string | null;
  photo: string | null;
  useAsCover: boolean;
  whatChanged: string;
  howItTurnedOut: string;
};

export function entryValues(fields: BakeFields & { photo?: string | null }): EntryValues {
  return {
    date: fields.date,
    scale: String(Math.round(fields.scale * 100) / 100),
    rating: fields.rating,
    photoPath: fields.photoPath,
    photo: fields.photo ?? null,
    useAsCover: fields.useAsCover ?? false,
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
  return {
    errors,
    fields: { date: v.date, scale, rating: v.rating, photoPath: v.photoPath, useAsCover: v.useAsCover, whatChanged: v.whatChanged, howItTurnedOut: v.howItTurnedOut },
  };
}

/** The resized photo's longest edge (BONES-recipes-log.md), well under the bucket's 5MB JPEG limit. */
const PHOTO_MAX_EDGE = 2048;

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
  const [photoPreview, setPhotoPreview] = useState(initial.photo);
  const [photoStatus, setPhotoStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [waitingOnPhoto, setWaitingOnPhoto] = useState(false);
  const [seen, setSeen] = useState(session);

  const id = useId();
  const dateRef = useRef<HTMLInputElement>(null);
  const scaleRef = useRef<HTMLInputElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const turnedOutRef = useRef<HTMLTextAreaElement>(null);
  const changedRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Whichever of the two notes fields was last focused, for "Keep editing" to return
  // to — not always the same one, now that there are two (How it turned out, What
  // changed). Defaults to How it turned out, matching its own autofocus-on-edit.
  const lastNoteFocused = useRef<HTMLTextAreaElement | null>(null);
  /** The currently in-flight upload, so Save can await it and a superseded pick
   * (a fast Replace, or Remove) can tell its own late arrival to clean up after itself. */
  const uploadRef = useRef<Promise<string | null> | null>(null);
  /** The resized blob behind the photo slot's current preview, kept so Retry can
   * re-send it without asking for the file again. */
  const pendingBlobRef = useRef<Blob | null>(null);
  /** The preview's object URL, revoked once it's replaced or the form is done with it. */
  const objectUrlRef = useRef<string | null>(null);

  if (seen !== session) {
    setSeen(session);
    setValues(initial);
    setErrors({});
    setConfirming(false);
    setFailed(false);
    discardPendingPhoto();
    setPhotoPreview(initial.photo);
    setPhotoStatus("idle");
  }

  useEffect(() => {
    if (confirming) keepRef.current?.focus();
  }, [confirming]);

  /** Chromium (not WebKit) fires the dialog's own native "cancel" — the same event
   * Escape uses — the moment a file input inside an open <dialog> opens its native
   * picker, which would otherwise close or discard the whole sheet before the
   * person has even chosen a photo. The page can't receive a real Escape while that
   * native picker has focus, so any close request arriving in this window is this
   * quirk, not a person; consumed once, with a generous bound in case the picker
   * closes without a file and without the quirk firing either. */
  const suppressCloseUntil = useRef(0);

  const dirty =
    (["date", "scale", "rating", "whatChanged", "howItTurnedOut"] as const).some((k) =>
      typeof values[k] === "string" ? values[k].trim() !== (initial[k] as string).trim() : values[k] !== initial[k],
    ) ||
    values.photoPath !== initial.photoPath ||
    values.useAsCover !== initial.useAsCover ||
    photoStatus === "uploading";

  /** A photo uploaded this session but never attached to a saved bake — replaced,
   * removed, or the form closing without saving. Best-effort; addBake/updateBake/
   * deleteBake already clean up a *saved* bake's own photo on their own. */
  function discardPendingPhoto() {
    if (uploadRef.current) {
      const inFlight = uploadRef.current;
      void inFlight.then((path) => {
        if (path) void deleteBakePhoto(path);
      });
      uploadRef.current = null;
    }
    if (values.photoPath && values.photoPath !== initial.photoPath) void deleteBakePhoto(values.photoPath);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    pendingBlobRef.current = null;
  }

  async function doUpload(blob: Blob) {
    const bytes = await blob.arrayBuffer();
    const promise = uploadBakePhoto(bytes);
    uploadRef.current = promise;
    const path = await promise;
    if (uploadRef.current !== promise) {
      // Superseded by a newer pick, a Replace, or a Remove while this was in flight.
      if (path) void deleteBakePhoto(path);
      return;
    }
    if (!path) {
      setPhotoStatus("error");
      return;
    }
    const oldPath = values.photoPath;
    if (oldPath && oldPath !== initial.photoPath) void deleteBakePhoto(oldPath);
    setValues((v) => ({ ...v, photoPath: path }));
    setPhotoStatus("idle");
  }

  function handleFile(file: File) {
    void (async () => {
      const blob = await resizeToJpeg(file, PHOTO_MAX_EDGE);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      pendingBlobRef.current = blob;
      setPhotoPreview(url);
      setPhotoStatus("uploading");
      await doUpload(blob);
    })();
  }

  function removePhoto() {
    if (uploadRef.current) {
      const inFlight = uploadRef.current;
      void inFlight.then((path) => {
        if (path) void deleteBakePhoto(path);
      });
      uploadRef.current = null;
    } else if (values.photoPath && values.photoPath !== initial.photoPath) {
      void deleteBakePhoto(values.photoPath);
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    pendingBlobRef.current = null;
    setPhotoPreview(null);
    setPhotoStatus("idle");
    setValues((v) => ({ ...v, photoPath: null }));
  }

  function requestClose() {
    if (Date.now() < suppressCloseUntil.current) {
      suppressCloseUntil.current = 0;
      return;
    }
    if (busy) return;
    if (confirming) keepEditing();
    else if (dirty) setConfirming(true);
    else {
      discardPendingPhoto();
      onClose();
    }
  }

  function keepEditing() {
    setConfirming(false);
    // Back to where the writing was.
    requestAnimationFrame(() => (lastNoteFocused.current ?? turnedOutRef.current)?.focus());
  }

  const set = (k: keyof EntryValues) => (value: string) => {
    setValues((v) => ({ ...v, [k]: value }));
    if (k === "date" || k === "scale") setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function pickPhoto() {
    suppressCloseUntil.current = Date.now() + 3000;
    fileInputRef.current?.click();
  }

  function retryPhoto() {
    const blob = pendingBlobRef.current;
    if (!blob) return;
    setPhotoStatus("uploading");
    void doUpload(blob);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const result = validate(values);
    setErrors(result.errors);
    if (!result.fields) {
      (result.errors.date ? dateRef : scaleRef).current?.focus();
      return;
    }
    // A settled upload failure blocks Save outright (BONES-recipes-log.md): the
    // photo slot's own Retry and "Save without photo" are the only ways past it,
    // so a bad connection never silently drops the photo.
    if (photoStatus === "error") return;
    setBusy(true);
    setFailed(false);
    // Save pressed while the photo's still uploading: wait for it rather than
    // saving ahead of it. A failure arriving during that wait blocks the save the
    // same way — photoStatus flips to "error" and Retry/"Save without photo" take over.
    if (photoStatus === "uploading" && uploadRef.current) {
      setWaitingOnPhoto(true);
      const path = await uploadRef.current;
      setWaitingOnPhoto(false);
      if (!path) {
        setBusy(false);
        return;
      }
      result.fields.photoPath = path;
    }
    const ok = await onSave(result.fields);
    setBusy(false);
    if (!ok) setFailed(true);
  }

  /** The photo slot's own escape hatch from a failed upload: drop the photo and
   * save the rest of the entry right away, instead of making a bad connection
   * block logging the bake at all. */
  async function saveWithoutPhoto() {
    if (busy) return;
    const result = validate(values);
    setErrors(result.errors);
    if (!result.fields) {
      (result.errors.date ? dateRef : scaleRef).current?.focus();
      return;
    }
    result.fields.photoPath = null;
    removePhoto();
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
      title={mode === "new" ? "Log this bake" : "Edit bake"}
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
              onConfirm={() => {
                discardPendingPhoto();
                onClose();
              }}
              onCancel={keepEditing}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-xs">
            <Button type="submit" form={formId} variant="primary" aria-busy={busy || undefined} className="w-full">
              {waitingOnPhoto ? "Uploading photo…" : busy ? "Saving…" : "Save"}
            </Button>
            <p className="type-caption text-muted">Only the date is required.</p>
          </div>
        )
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="flex flex-col gap-base pt-xs">
        {failed && <Notice tone="error">Couldn&apos;t save this bake. Check your connection and try again.</Notice>}
        <div className="grid grid-cols-2 gap-base">
          <BakedOnField ref={dateRef} id={`${id}-date`} value={values.date} error={errors.date} onChange={set("date")} />
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
        <StarRating
          value={values.rating}
          onChange={(n) => setValues((v) => ({ ...v, rating: n }))}
          large
          autoFocus={mode === "new"}
          className="justify-center"
        />
        <div className="flex flex-col gap-xs">
          <label htmlFor={`${id}-result`} className="type-label text-muted">
            How it turned out
          </label>
          <Textarea
            ref={turnedOutRef}
            id={`${id}-result`}
            data-autofocus={mode === "edit" ? true : undefined}
            value={values.howItTurnedOut}
            placeholder="Crisp base, custard a little loose…"
            onChange={(e) => set("howItTurnedOut")(e.target.value)}
            onFocus={() => (lastNoteFocused.current = turnedOutRef.current)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor={`${id}-changed`} className="type-label text-muted">
            What changed
          </label>
          <Textarea
            ref={changedRef}
            id={`${id}-changed`}
            value={values.whatChanged}
            placeholder="Less sugar, hotter oven, longer proof…"
            onChange={(e) => set("whatChanged")(e.target.value)}
            onFocus={() => (lastNoteFocused.current = changedRef.current)}
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            suppressCloseUntil.current = 0;
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleFile(file);
          }}
        />
        <PhotoField
          preview={photoPreview}
          status={photoStatus}
          onPick={pickPhoto}
          onReplace={pickPhoto}
          onRemove={removePhoto}
          onRetry={retryPhoto}
          onSaveWithoutPhoto={saveWithoutPhoto}
          useAsCover={values.useAsCover}
          onUseAsCoverChange={(next) => setValues((v) => ({ ...v, useAsCover: next }))}
        />
      </form>
    </Dialog>
  );
}
