"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { RecipeEditor } from "@/components/editor/RecipeEditor";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { cx } from "@/components/ui/cx";
import { useKeyboardOpen } from "@/components/ui/useKeyboardOpen";
import { discardDraft, retryImport, saveDraftContent, saveImport } from "@/lib/data/actions";
import { blockers, emptyEditor, saveStatus, type EditorState } from "@/lib/data/editor";
import type { Draft } from "@/lib/data/types";
import { DiscardDialog } from "./DiscardDialog";
import { NeedsYourCheck } from "./NeedsYourCheck";
import { SourcePanel } from "./SourcePanel";

// /import/:draftId (Review Import), BONES-import-detail.md. Page header, then Source
// and Needs Your Check (left column, sticky on desktop), then the Recipe Editor.
// Edits autosave to the draft. Save recipe is the primary action: the sticky Save bar
// on mobile, in the page header from tablet up.

const AUTOSAVE_MS = 600;

export function ReviewImport({ draft }: { draft: Draft }) {
  const router = useRouter();
  const [state, setState] = useState<EditorState>(draft.content ?? emptyEditor(draft.reelUrl));
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving">("saved");
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [captionOpen, setCaptionOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const discardButton = useRef<HTMLButtonElement>(null);
  const keyboardOpen = useKeyboardOpen();
  const first = useRef(true);

  // Autosave every edit to the draft.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setDraftStatus("saving");
    const t = window.setTimeout(async () => {
      await saveDraftContent(draft.id, state);
      setDraftStatus("saved");
    }, AUTOSAVE_MS);
    return () => window.clearTimeout(t);
  }, [state, draft.id]);

  const problems = useMemo(() => blockers(state), [state]);
  const errors = useMemo(() => new Set(attempted ? problems.map((p) => p.fieldId) : []), [attempted, problems]);
  const barStatus = saveStatus(problems.length);

  async function save() {
    if (saving) return;
    if (problems.length) {
      setAttempted(true);
      // Focus the error summary once it renders; on mobile the page scrolls to it.
      requestAnimationFrame(() => {
        summaryRef.current?.scrollIntoView({ block: "start" });
        summaryRef.current?.focus({ preventScroll: true });
      });
      return;
    }
    setSaving(true);
    setFailed(false);
    const result = await saveImport(draft.id, state);
    if (result.ok) {
      router.push(`/recipes/${result.recipeId}`);
      return;
    }
    setSaving(false);
    if (result.error === "blocked") setAttempted(true);
    else setFailed(true);
  }

  /** Couldn't finish: Retry runs the Shortcut again; the draft goes back to Importing on the Library. */
  async function retry() {
    await retryImport(draft.id);
    router.push("/recipes");
    router.refresh();
  }

  const saveFailed = failed && (
    <Notice tone="error" action={<Button variant="text" onClick={save} className="-my-md -ml-sm">Retry</Button>}>
      Couldn&rsquo;t save the recipe. Your edits are kept in the draft.
    </Notice>
  );

  return (
    <>
      {/* Page header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-lg">
        <div>
          <h1 className="type-display-md text-ink desktop:type-display-lg">Review import</h1>
          <p role="status" className="mt-xs type-caption text-muted">
            {draftStatus === "saving" ? "Saving…" : "Draft saved"}
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <Button ref={discardButton} variant="text" aria-haspopup="dialog" onClick={() => setDiscardOpen(true)}>
            Discard
          </Button>
          {/* Save bar: the sticky action-bar on mobile (hidden while the keyboard is open), in the header from tablet up */}
          <div
            data-action-bar
            className={cx(
              "z-20 max-tablet:pin-bottom bg-canvas px-(--gutter) pt-sm pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:z-auto tablet:bg-transparent tablet:p-0 tablet:shadow-none",
              keyboardOpen && "max-tablet:hidden",
            )}
          >
            {saveFailed && <div className="mb-sm tablet:hidden">{saveFailed}</div>}
            <p aria-live="polite" className="mb-sm type-body-sm text-ink tablet:sr-only">
              {barStatus}
            </p>
            <Button variant="primary" onClick={save} aria-busy={saving || undefined} className="w-full tablet:w-auto">
              {saving ? "Saving…" : "Save recipe"}
            </Button>
          </div>
        </div>
      </div>
      {saveFailed && <div className="mt-base max-tablet:hidden">{saveFailed}</div>}

      <div className="mt-lg tablet:grid tablet:grid-cols-8 tablet:items-start tablet:gap-x-(--gutter) desktop:mt-xl desktop:grid-cols-12">
        {/* Left column: Source and Needs Your Check; sticky unless the transcript is open */}
        <div className={cx("flex flex-col gap-lg tablet:col-span-3 desktop:col-span-4 desktop:gap-xl", !captionOpen && "tablet:sticky tablet:top-base")}>
          <SourcePanel draft={draft} expanded={captionOpen} onExpandedChange={setCaptionOpen} />
          <NeedsYourCheck state={state} problems={attempted ? problems : null} summaryRef={summaryRef} incomplete={draft.status === "failed" ? { onRetry: retry } : undefined} />
          {/* BONES 1.3.0: Save repeated at the end of the sticky left column, so it stays in view (not on mobile, which has the Save bar) */}
          <Button variant="primary" onClick={save} aria-busy={saving || undefined} className="w-full max-tablet:hidden">
            {saving ? "Saving…" : "Save recipe"}
          </Button>
        </div>
        <div className="mt-lg tablet:col-span-5 tablet:mt-0 desktop:col-span-8">
          <RecipeEditor state={state} setState={setState} errors={errors} />
        </div>
      </div>

      <DiscardDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        returnFocus={discardButton}
        onDiscard={async () => {
          await discardDraft(draft.id);
          router.push("/recipes");
          router.refresh();
        }}
      />
    </>
  );
}
