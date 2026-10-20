"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { Picture } from "@/components/ui/Picture";
import { Toggle } from "@/components/ui/Toggle";

/**
 * BONES-recipes-log.md's photo slot, presentational: no photo yet → "Add a photo"
 * (opens the phone's own camera/library picker, lib/photo-resize.ts resizes
 * whatever comes back); a photo → its 4:3 preview with Replace and Remove, a
 * busy or error state while it uploads (uploaded as soon as it's picked, ahead of
 * Save), and "Use as recipe cover" once it's there to toggle. A failed upload adds
 * a notice with Retry and "Save without photo" under the preview, without hiding
 * Replace/Remove — a bad connection shouldn't also take away the other ways out.
 */
export function PhotoField({
  preview,
  status,
  onPick,
  onReplace,
  onRemove,
  onRetry,
  onSaveWithoutPhoto,
  useAsCover,
  onUseAsCoverChange,
}: {
  preview: string | null;
  status: "idle" | "uploading" | "error";
  onPick: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onRetry: () => void;
  onSaveWithoutPhoto: () => void;
  useAsCover: boolean;
  onUseAsCoverChange: (next: boolean) => void;
}) {
  const retryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (status === "error") retryRef.current?.focus();
  }, [status]);

  if (!preview) {
    return (
      <div className="flex flex-col gap-xs">
        <Button type="button" variant="secondary" onClick={onPick} className="justify-start gap-sm">
          <Camera aria-hidden="true" strokeWidth={1.8} />
          Add a photo
        </Button>
        <p className="type-caption text-muted">Can become the recipe&apos;s cover</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-sm">
      <Picture src={preview} aspectRatio="4 / 3" rounded="md" className="w-full" />
      {status === "error" && (
        <div role="alert">
          <Notice
            tone="error"
            action={
              <div className="flex gap-sm">
                <Button ref={retryRef} variant="text" onClick={onRetry} className="-my-md -ml-sm">
                  Retry
                </Button>
                <Button variant="text" onClick={onSaveWithoutPhoto} className="-my-md">
                  Save without photo
                </Button>
              </div>
            }
          >
            Photo didn&apos;t upload.
          </Notice>
        </div>
      )}
      <div className="flex gap-sm">
        <Button type="button" variant="secondary" onClick={onReplace} aria-busy={status === "uploading" || undefined} className="flex-1">
          {status === "uploading" ? "Uploading…" : "Replace"}
        </Button>
        <Button type="button" variant="secondary" onClick={onRemove} className="flex-1">
          Remove
        </Button>
      </div>
      <Toggle label="Use as recipe cover" checked={useAsCover} onChange={onUseAsCoverChange} />
    </div>
  );
}
