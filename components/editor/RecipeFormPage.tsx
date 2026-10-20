"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorSummary, NeedsYourCheck } from "@/components/import/NeedsYourCheck";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Notice } from "@/components/ui/Notice";
import { cx } from "@/components/ui/cx";
import { useKeyboardOpen } from "@/components/ui/useKeyboardOpen";
import { createRecipe, deleteRecipe, updateRecipe } from "@/lib/data/actions";
import { blockers, checkItems, saveStatus, type EditorState } from "@/lib/data/editor";
import { RecipeEditor } from "./RecipeEditor";

// /recipes/new and /recipes/:recipeId/edit: the Recipe editor template (SKELETON).
// There's no BONES file for these pages; they follow Review Import's page header and
// Save bar, with the editor in 8 of 12 columns on desktop. Edit adds Delete recipe.
// Leaving with unsaved changes asks first.

export function RecipeFormPage({
  mode,
  initial,
  recipeId,
  recipeTitle,
}: {
  mode: "new" | "edit";
  initial: EditorState;
  recipeId?: string;
  recipeTitle?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const keyboardOpen = useKeyboardOpen();
  const saved = useRef(false);

  const initialJson = useMemo(() => JSON.stringify(initial), [initial]);
  const dirty = JSON.stringify(state) !== initialJson;
  const problems = useMemo(() => blockers(state), [state]);
  const errors = useMemo(() => new Set(attempted ? problems.map((p) => p.fieldId) : []), [attempted, problems]);
  const barStatus = saveStatus(problems.length);
  const backHref = mode === "edit" ? `/recipes/${recipeId}` : "/recipes";
  // BONES-import-detail 1.6.1: Edit shows the same Needs Your Check panel as Review
  // Import (no Source) whenever something's left to check; New never does, since
  // amounts typed by hand are confirmed as typed. Hidden again once nothing's left.
  const showCheck = mode === "edit" && checkItems(state).length > 0;

  // SKELETON: unsaved changes on leave → confirmation. Covers in-app links and
  // closing or reloading the tab.
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (saved.current) return;
      e.preventDefault();
    }
    function onClick(e: MouseEvent) {
      if (saved.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.origin !== window.location.origin || link.closest("dialog")) return;
      if (link.pathname === window.location.pathname) return;
      e.preventDefault();
      setLeaveTo(link.pathname + link.search);
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  async function save() {
    if (saving) return;
    if (problems.length) {
      setAttempted(true);
      requestAnimationFrame(() => {
        summaryRef.current?.scrollIntoView({ block: "start" });
        summaryRef.current?.focus({ preventScroll: true });
      });
      return;
    }
    setSaving(true);
    setFailed(false);
    const result = mode === "edit" ? await updateRecipe(recipeId!, state) : await createRecipe(state);
    if (result.ok) {
      saved.current = true;
      router.push(`/recipes/${result.recipeId}`);
      router.refresh();
      return;
    }
    setSaving(false);
    if (result.error === "blocked") setAttempted(true);
    else setFailed(true);
  }

  const saveFailed = failed && (
    <Notice tone="error" action={<Button variant="text" onClick={save} className="-my-md -ml-sm">Retry</Button>}>
      Couldn&rsquo;t save the recipe. Your changes are still here.
    </Notice>
  );

  return (
    <>
      <BackLink href={backHref}>{mode === "edit" ? recipeTitle : "Library"}</BackLink>
      <div className="mt-xs grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-lg">
        <h1 className="type-display-md text-ink desktop:type-display-lg">{mode === "edit" ? "Edit recipe" : "New recipe"}</h1>
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
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {saveFailed && <div className="mt-base max-tablet:hidden">{saveFailed}</div>}

      <div
        className={cx(
          "mt-lg desktop:mt-xl",
          showCheck ? "tablet:grid tablet:grid-cols-8 tablet:items-start tablet:gap-x-(--gutter) desktop:grid-cols-12" : "desktop:max-w-[calc(var(--col)*8+var(--gutter)*7)]",
        )}
      >
        {showCheck && (
          <div className="flex flex-col gap-lg tablet:sticky tablet:top-base tablet:col-span-3 desktop:col-span-4">
            <NeedsYourCheck state={state} setState={setState} problems={attempted ? problems : null} summaryRef={summaryRef} />
          </div>
        )}
        <div className={cx(showCheck && "mt-lg tablet:col-span-5 tablet:mt-0 desktop:col-span-8")}>
          {!showCheck && attempted && problems.length > 0 && (
            <div className="mb-lg">
              <ErrorSummary ref={summaryRef} problems={problems} />
            </div>
          )}
          <RecipeEditor state={state} setState={setState} errors={errors} />

          {mode === "edit" && (
            <div className="mt-2xl border-t border-hairline pt-base">
              <Button ref={deleteButton} variant="text" aria-haspopup="dialog" onClick={() => setDeleteOpen(true)} className="-ml-sm">
                Delete recipe
              </Button>
            </div>
          )}
        </div>
      </div>

      {mode === "edit" && (
        <ConfirmDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          returnFocus={deleteButton}
          title="Delete this recipe?"
          body="Its bake log goes with it, and its share link stops working."
          confirm="Delete recipe"
          cancel="Keep recipe"
          onConfirm={async () => {
            saved.current = true;
            await deleteRecipe(recipeId!);
            router.push("/recipes");
            router.refresh();
          }}
        />
      )}
      <ConfirmDialog
        open={leaveTo !== null}
        onClose={() => setLeaveTo(null)}
        title="Leave without saving?"
        body={mode === "edit" ? "Your changes to this recipe will be lost." : "This recipe hasn't been saved and will be lost."}
        confirm="Leave"
        cancel="Keep editing"
        onConfirm={async () => {
          saved.current = true;
          const to = leaveTo!;
          setLeaveTo(null);
          router.push(to);
        }}
      />
    </>
  );
}
