"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ActionMenu } from "@/components/editor/ActionMenu";
import { focusFor } from "@/components/system/InputModality";
import { BackLink } from "@/components/ui/BackLink";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Picture } from "@/components/ui/Picture";
import { PictureChip } from "@/components/ui/PictureChip";
import { RecordRow } from "@/components/ui/RecordRow";
import { StarGlyph } from "@/components/ui/Star";
import { TilePanel } from "@/components/ui/Tile";
import { cx } from "@/components/ui/cx";
import type { BakeFields } from "@/lib/data/actions";
import { bakeCount, detectMilestone, type Milestone } from "@/lib/data/bakeLog";
import type { BakeLogEntry, Recipe } from "@/lib/data/types";
import { useOwnerRecipe } from "@/lib/data/useOwnerRecipe";
import { formatBakeDate, formatScale, parseScale, todayIso } from "@/lib/format";
import { Celebration } from "./Celebration";
import { CelebrationToast } from "./CelebrationToast";
import { EntryForm, entryValues, type EntryValues } from "./EntryForm";

// /recipes/:recipeId/log (Bake Log), BONES-recipes-log.md. One centered reading
// column (8 of 12 cols on desktop): Page header, then Entries, newest first, 20 at a
// time. Log a bake is in the header from tablet up and a sticky bar on mobile; it
// opens the entry form at ?new=1, which Bake Mode's Finish also links to. Edit and
// Add notes open an entry's form at ?edit=<entryId> (SKELETON 1.3.2); an unknown id
// just drops the param. Opening and closing the form replace the history entry.
// Saving a new bake: a milestone gets the full-screen Celebration, anything else a
// CelebrationToast — either way, the new entry highlights and takes focus once that
// closes, not before (BONES: the After-save moment, section 3).

const PAGE = 20;

type FormState = { mode: "new" } | { mode: "edit"; entry: BakeLogEntry };

const headingId = (entryId: string) => `bake-${entryId}`;

export function BakeLogView({ initial }: { initial: Recipe }) {
  const { recipe, actions } = useOwnerRecipe(initial);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const editId = searchParams.get("edit");
  const { scale: bakedScale } = parseScale(searchParams.get("scale") ?? undefined);

  const entries = recipe.bakeLog;
  const editEntry = editId ? (entries.find((e) => e.id === editId) ?? null) : null;
  const formKey = editEntry ? `edit:${editEntry.id}` : isNew ? "new" : null;

  const [shown, setShown] = useState(PAGE);
  const [session, setSession] = useState(0);
  const [lastKey, setLastKey] = useState<string | null>(null);
  // Closed at once on Save or Cancel, before the URL catches up.
  const [dismissed, setDismissed] = useState<string | null>(null);
  // The last entry opened for editing, kept after the form closes for focus to return to.
  const [editedId, setEditedId] = useState<string | null>(null);
  // A form arriving in the URL starts fresh; an edited entry is brought onto the page.
  if (formKey !== lastKey) {
    setLastKey(formKey);
    setDismissed(null);
    if (formKey) setSession((n) => n + 1);
    if (formKey === "new") setEditedId(null);
    if (editEntry) {
      setEditedId(editEntry.id);
      const index = entries.indexOf(editEntry);
      if (index >= shown) setShown(Math.ceil((index + 1) / PAGE) * PAGE);
    }
  }
  const form: FormState | null =
    formKey === null || formKey === dismissed ? null : editEntry ? { mode: "edit", entry: editEntry } : { mode: "new" };

  // An unknown entry id: show the log without the form and correct the URL, no error.
  useEffect(() => {
    if (editId && !editEntry) router.replace(pathname, { scroll: false });
  }, [editId, editEntry, pathname, router]);

  const [deleting, setDeleting] = useState<BakeLogEntry | null>(null);
  const [newEntry, setNewEntry] = useState<BakeLogEntry | null>(null);
  // What the After-save moment shows once the form finishes closing: a milestone's
  // kind, or "toast" for an everyday save — set at save time, consumed once (Dialog's
  // onAfterClose), so Celebration/the toast never fights the form's own close animation.
  const [pendingAfterSave, setPendingAfterSave] = useState<Milestone | "toast" | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Matches globals.css's entry-new animation length. A timer, not onAnimationEnd: under
  // reduced motion the animation is disabled outright (no transition/animation at all,
  // app fix this round), so that event would never fire and the highlight would stick.
  useEffect(() => {
    if (!highlightId) return;
    const t = window.setTimeout(() => setHighlightId(null), 2400);
    return () => window.clearTimeout(t);
  }, [highlightId]);

  const list = useRef<HTMLUListElement>(null);
  const logButton = useRef<HTMLAnchorElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  /** What opened the form (Log a bake, Add notes, an entry menu), for focus to return to. */
  const formOpener = useRef<HTMLElement | null>(null);
  /** Set once a bake is deleted: the heading to focus next, or null for the H1 (the log is empty). */
  const afterDelete = useRef<{ id: string | null } | null>(null);
  /** The menu button that opened the Delete confirmation, for Cancel to return to. */
  const deleteOpener = useRef<HTMLElement | null>(null);

  /** Polite status message; cleared first so the same words are announced again. */
  function announce(message: string) {
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(message), 100);
  }

  function closeForm() {
    setDismissed(formKey);
    router.replace(pathname, { scroll: false });
  }

  const editHref = (entry: BakeLogEntry) => `${pathname}?edit=${encodeURIComponent(entry.id)}`;

  /** Entry menu > Edit: focus returns to the menu's button. */
  function openEdit(entry: BakeLogEntry, trigger: HTMLElement | null) {
    formOpener.current = trigger;
    router.replace(editHref(entry), { scroll: false });
  }

  async function saveNew(fields: BakeFields) {
    const entry = await actions.addBake(fields);
    if (!entry) return false;
    // Make sure the new entry is on the page (an older date can sort it further down).
    const index = [entry, ...entries].filter((e) => e.date > entry.date).length;
    if (index >= shown) setShown(Math.ceil((index + 1) / PAGE) * PAGE);
    setNewEntry(entry);
    setPendingAfterSave(detectMilestone([entry, ...entries], entry) ?? "toast");
    closeForm();
    return true;
  }

  async function saveEdit(entry: BakeLogEntry, fields: BakeFields) {
    const ok = await actions.updateBake(entry.id, fields);
    if (!ok) return false;
    announce("Bake saved");
    closeForm();
    return true;
  }

  /** The new entry highlights and takes focus once Celebration or the toast has
   * closed on its own (Done/Esc/outside-tap, or the toast's own timeout) — not on
   * Undo, which removes the entry instead. */
  function finishNew() {
    if (!newEntry) return;
    setHighlightId(newEntry.id);
    requestAnimationFrame(() => focusFor(document.getElementById(headingId(newEntry.id))));
  }

  async function undoNew() {
    if (!newEntry) return;
    setToastOpen(false);
    const id = newEntry.id;
    setNewEntry(null);
    await actions.removeBake(id);
    announce("Bake removed");
  }

  async function confirmDelete() {
    if (!deleting) return;
    const i = entries.findIndex((e) => e.id === deleting.id);
    const neighbour = entries[i + 1] ?? entries[i - 1];
    afterDelete.current = { id: neighbour ? headingId(neighbour.id) : null };
    await actions.removeBake(deleting.id);
    announce("Bake deleted");
    setDeleting(null);
  }

  function showMore() {
    const firstNew = shown;
    setShown(shown + PAGE);
    requestAnimationFrame(() => list.current?.children[firstNew]?.querySelector<HTMLElement>("h2")?.focus());
  }

  const formInitial: EntryValues =
    form?.mode === "edit"
      ? entryValues(form.entry)
      : entryValues({ date: todayIso(), scale: bakedScale, rating: null, photoPath: null, whatChanged: "", howItTurnedOut: "" });

  return (
    <div className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
      {/* Page header */}
      <div className="flex flex-col items-start">
        <BackLink href={`/recipes/${recipe.id}`} className="max-w-full">
          <span className="truncate">{recipe.title}</span>
        </BackLink>
        {entries.length === 0 ? (
          <div className="mt-lg flex w-full flex-col items-center text-center desktop:mt-xl">
            <TilePanel className="w-full max-w-[calc(var(--spacing-3xl)*4)]" />
            <DisplayTitle ref={h1} tabIndex={-1} lead="Not baked" accent="yet." className="mt-lg text-ink" />
            <p className="mt-xs type-body-md text-muted">Note what you change each time, and the next bake gets better.</p>
            {/* Log a bake stays the primary action even when empty. */}
            <LogABakeAction href={`${pathname}?new=1`} buttonRef={logButton} onClick={(e) => (formOpener.current = e.currentTarget)} className="mt-lg tablet:flex tablet:justify-center" />
          </div>
        ) : (
          <div className="mt-xs flex w-full items-start justify-between gap-lg">
            <div>
              <DisplayTitle ref={h1} tabIndex={-1} lead="Bake" accent="log." className="text-ink" />
              <p className="mt-xs type-body-sm text-muted">{bakeCount(entries.length)}</p>
            </div>
            {/* Log bar (primary action): pinned on mobile, in the header from tablet up. */}
            <LogABakeAction href={`${pathname}?new=1`} buttonRef={logButton} onClick={(e) => (formOpener.current = e.currentTarget)} className="tablet:shrink-0" />
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <>
          <ul ref={list} role="list" className="mt-lg flex flex-col gap-md desktop:mt-xl">
            {entries.slice(0, shown).map((entry) => (
              <li key={entry.id}>
                <Entry
                  entry={entry}
                  isCover={recipe.coverBakeId === entry.id}
                  highlighted={entry.id === highlightId}
                  editHref={editHref(entry)}
                  onEdit={(trigger) => openEdit(entry, trigger)}
                  onAddNotes={(link) => (formOpener.current = link)}
                  onDelete={(trigger) => {
                    deleteOpener.current = trigger;
                    setDeleting(entry);
                  }}
                />
              </li>
            ))}
          </ul>
          {entries.length > shown && (
            <Button variant="text" onClick={showMore} className="mt-sm -ml-sm">
              Show more
            </Button>
          )}
        </>
      )}

      <p role="status" className="sr-only">
        {announcement}
      </p>

      <EntryForm
        open={form !== null}
        session={session}
        mode={form?.mode ?? "new"}
        initial={formInitial}
        onSave={(fields) => (form?.mode === "edit" ? saveEdit(form.entry, fields) : saveNew(fields))}
        onClose={closeForm}
        returnFocus={() => {
          // The opener; if it's gone (Add notes disappears once there are notes) or the
          // form came from the URL, the edited entry's heading, else Log a bake.
          const opener = formOpener.current;
          formOpener.current = null;
          if (opener?.isConnected) return opener;
          return (editedId && document.getElementById(headingId(editedId))) || logButton.current;
        }}
        onAfterClose={() => {
          if (pendingAfterSave === null) return;
          if (pendingAfterSave === "toast") setToastOpen(true);
          else {
            setMilestone(pendingAfterSave);
            setCelebrationOpen(true);
          }
          setPendingAfterSave(null);
        }}
      />

      <Celebration
        open={celebrationOpen}
        milestone={milestone}
        recipeTitle={recipe.title}
        rating={newEntry?.rating ?? null}
        date={newEntry?.date ?? todayIso()}
        onClose={() => {
          setCelebrationOpen(false);
          finishNew();
        }}
        returnFocus={() => (newEntry ? document.getElementById(headingId(newEntry.id)) : null)}
      />

      <CelebrationToast
        open={toastOpen}
        onUndo={undoNew}
        onDismiss={() => {
          setToastOpen(false);
          finishNew();
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        returnFocus={() => {
          // Cancel: back to the entry's menu button (the opener). After a delete: the
          // next entry's heading, or the H1 once the log is empty.
          const target = afterDelete.current;
          const opener = deleteOpener.current;
          afterDelete.current = null;
          deleteOpener.current = null;
          if (!target) return opener?.isConnected ? opener : null;
          return target.id ? document.getElementById(target.id) : h1.current;
        }}
        title="Delete this bake?"
        body={
          deleting && (
            <>
              The {formatBakeDate(deleting.date)} bake
              {deleting.whatChanged || deleting.howItTurnedOut ? " and its notes" : ""} will be removed.
              {entries.length === 1 && <span className="mt-sm block">The recipe will show as Not baked yet.</span>}
              {deleting.id === recipe.coverBakeId && <span className="mt-sm block">Its photo is the recipe&apos;s cover; the reel picture comes back.</span>}
            </>
          )
        }
        confirm="Delete"
        cancel="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

/** "Log a bake": pinned on mobile, in the header (or centred, when empty) from tablet up. */
function LogABakeAction({
  href,
  buttonRef,
  onClick,
  className,
}: {
  href: string;
  buttonRef: React.Ref<HTMLAnchorElement>;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  return (
    <div
      data-action-bar
      className={cx(
        "z-20 max-tablet:pin-bottom bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:z-auto tablet:bg-transparent tablet:p-0 tablet:shadow-none",
        className,
      )}
    >
      <ButtonLink ref={buttonRef} href={href} replace scroll={false} variant="primary" className="w-full tablet:w-auto" onClick={onClick}>
        Log a bake
      </ButtonLink>
    </div>
  );
}

function Entry({
  entry,
  isCover,
  highlighted,
  editHref,
  onEdit,
  onAddNotes,
  onDelete,
}: {
  entry: BakeLogEntry;
  isCover: boolean;
  highlighted: boolean;
  editHref: string;
  onEdit: (trigger: HTMLElement | null) => void;
  onAddNotes: (link: HTMLAnchorElement) => void;
  onDelete: (trigger: HTMLElement | null) => void;
}) {
  const date = formatBakeDate(entry.date);
  const hasNotes = Boolean(entry.whatChanged || entry.howItTurnedOut);
  return (
    <div data-testid="bake-entry" className={cx("rounded-tile border border-outline bg-canvas p-base text-ink", highlighted && "animate-[entry-new_2400ms_var(--ease-skin)]")}>
      <dl>
        <RecordRow label="baked">
          <div className="flex items-center gap-sm">
            <h2 id={headingId(entry.id)} tabIndex={-1} className="type-body-md font-bold text-ink">
              {date}
            </h2>
            <ActionMenu
              label={`More actions, ${date} bake`}
              title={`${date} bake`}
              items={[
                { label: "Edit", onSelect: onEdit },
                { label: "Delete", onSelect: onDelete, destructive: true },
              ]}
            />
          </div>
        </RecordRow>
        {entry.scale !== 1 && (
          <RecordRow label="scale">
            <span className="type-body-md tabular-nums">{formatScale(entry.scale)}</span>
          </RecordRow>
        )}
        {entry.rating !== null && (
          <RecordRow label="rating">
            <span className="inline-flex items-center gap-[1px]">
              <span className="sr-only">Rated {entry.rating} out of 5</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <StarGlyph key={n} filled={n <= entry.rating!} className="size-[15px]" />
              ))}
            </span>
          </RecordRow>
        )}
      </dl>
      {entry.photo && (
        <div className="relative my-sm border-y border-outline">
          <Picture src={entry.photo} aspectRatio="4 / 3" rounded="none" className="w-full">
            {isCover && <PictureChip className="absolute bottom-sm left-sm">Cover</PictureChip>}
          </Picture>
        </div>
      )}
      {hasNotes ? (
        <dl>
          {entry.howItTurnedOut && (
            <RecordRow label="how it turned out" stacked>
              <p className="whitespace-pre-line type-voice">{entry.howItTurnedOut}</p>
            </RecordRow>
          )}
          {entry.whatChanged && (
            <RecordRow label="what changed" stacked>
              <p className="whitespace-pre-line type-voice">{entry.whatChanged}</p>
            </RecordRow>
          )}
        </dl>
      ) : (
        <p className="flex flex-wrap items-center gap-x-sm border-b border-outline py-sm type-body-md text-muted">
          No notes <span aria-hidden="true">·</span>
          <ButtonLink
            href={editHref}
            replace
            scroll={false}
            variant="text"
            onClick={(e) => onAddNotes(e.currentTarget)}
            aria-label={`Add notes, ${date} bake`}
            className="-ml-sm"
          >
            Add notes
          </ButtonLink>
        </p>
      )}
    </div>
  );
}
