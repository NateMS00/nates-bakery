"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ActionMenu } from "@/components/editor/ActionMenu";
import { RatingPrompt } from "@/components/recipe/RatingPrompt";
import { BackLink } from "@/components/ui/BackLink";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TilePanel } from "@/components/ui/Tile";
import { cx } from "@/components/ui/cx";
import type { BakeFields } from "@/lib/data/actions";
import { bakeCount } from "@/lib/data/bakeLog";
import type { BakeLogEntry, Recipe } from "@/lib/data/types";
import { useOwnerRecipe } from "@/lib/data/useOwnerRecipe";
import { formatBakeDate, formatScale, parseScale, todayIso } from "@/lib/format";
import { EntryForm, entryValues, type EntryValues } from "./EntryForm";

// /recipes/:recipeId/log (Bake Log), BONES-recipes-log.md. One centered reading
// column (8 of 12 cols on desktop): Page header, then Entries, newest first, 20 at a
// time. Log a bake is in the header from tablet up and a sticky bar on mobile; it
// opens the entry form at ?new=1, which Bake Mode's Finish also links to. Edit and
// Add notes open an entry's form at ?edit=<entryId> (SKELETON 1.3.2); an unknown id
// just drops the param. Opening and closing the form replace the history entry.

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
  const [rateAfterClose, setRateAfterClose] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

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
    setNewEntryId(entry.id);
    setRateAfterClose(true);
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

  function finishNew() {
    setRatingOpen(false);
    setHighlightId(newEntryId);
    // After the Rating prompt closes, so the dialog's own announcement doesn't cut it off.
    announce("Bake saved");
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
      : entryValues({ date: todayIso(), scale: bakedScale, whatChanged: "", howItTurnedOut: "" });

  return (
    <div className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
      {/* Page header */}
      <div className="flex flex-col items-start">
        <BackLink href={`/recipes/${recipe.id}`} className="max-w-full">
          <span className="truncate">{recipe.title}</span>
        </BackLink>
        <div className="mt-xs flex w-full items-start justify-between gap-lg">
          <div>
            <h1 ref={h1} tabIndex={-1} className="type-display-md text-ink desktop:type-display-lg">
              Bake log
            </h1>
            {entries.length > 0 && <p className="mt-xs type-body-sm text-muted">{bakeCount(entries.length)}</p>}
          </div>
          {/* Log bar (primary action): pinned on mobile, in the header from tablet up. */}
          <div
            data-action-bar
            className="z-20 max-tablet:pin-bottom bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:z-auto tablet:shrink-0 tablet:bg-transparent tablet:p-0 tablet:shadow-none"
          >
            <ButtonLink
              ref={logButton}
              href={`${pathname}?new=1`}
              replace
              scroll={false}
              variant="primary"
              className="w-full tablet:w-auto"
              onClick={(e) => (formOpener.current = e.currentTarget)}
            >
              Log a bake
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Entries (SKELETON section 1) */}
      {entries.length === 0 ? (
        <div className="mx-auto mt-lg flex flex-col items-center text-center tablet:max-w-[calc(var(--col)*4+var(--gutter)*3)] desktop:mt-xl">
          <TilePanel className="w-full max-w-[calc(var(--spacing-3xl)*4)]" />
          <p className="mt-lg type-body-lg text-ink">No bakes logged yet</p>
          <p className="mt-xs type-body-md text-muted">Note what you change each time, and the next bake gets better.</p>
        </div>
      ) : (
        <>
          <ul ref={list} role="list" className="mt-lg flex flex-col gap-md desktop:mt-xl">
            {entries.slice(0, shown).map((entry) => (
              <li key={entry.id}>
                <Entry
                  entry={entry}
                  highlighted={entry.id === highlightId}
                  onHighlightEnd={() => setHighlightId(null)}
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
          if (!rateAfterClose) return;
          setRateAfterClose(false);
          setRatingOpen(true);
        }}
      />

      <RatingPrompt
        open={ratingOpen}
        title="How was this bake?"
        value={recipe.rating}
        onRate={(n) => {
          actions.setRating(n);
          finishNew();
        }}
        onClose={finishNew}
        returnFocus={() => (newEntryId ? document.getElementById(headingId(newEntryId)) : null)}
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

function Entry({
  entry,
  highlighted,
  onHighlightEnd,
  editHref,
  onEdit,
  onAddNotes,
  onDelete,
}: {
  entry: BakeLogEntry;
  highlighted: boolean;
  onHighlightEnd: () => void;
  editHref: string;
  onEdit: (trigger: HTMLElement | null) => void;
  onAddNotes: (link: HTMLAnchorElement) => void;
  onDelete: (trigger: HTMLElement | null) => void;
}) {
  const date = formatBakeDate(entry.date);
  const hasNotes = Boolean(entry.whatChanged || entry.howItTurnedOut);
  return (
    <Card
      className={cx(highlighted && "animate-[entry-new_2400ms_var(--ease-skin)]")}
      onAnimationEnd={onHighlightEnd}
    >
      <div className="-mt-sm -mr-sm flex items-start justify-between gap-sm">
        <h2 id={headingId(entry.id)} tabIndex={-1} className="pt-sm type-heading text-ink">
          {date}
          {entry.scale !== 1 && (
            <span className="text-muted">
              {" "}
              <span aria-hidden="true">·</span> <span className="sr-only">at </span>
              <span className="tabular-nums">{formatScale(entry.scale)}</span>
            </span>
          )}
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
      {hasNotes ? (
        <dl>
          {entry.whatChanged && (
            <>
              <dt className="mt-sm type-label text-muted">What changed</dt>
              <dd className="mt-xs whitespace-pre-line type-body-sm text-body tablet:type-body-md">{entry.whatChanged}</dd>
            </>
          )}
          {entry.howItTurnedOut && (
            <>
              <dt className="mt-md type-label text-muted first:mt-sm">How it turned out</dt>
              <dd className="mt-xs whitespace-pre-line type-body-sm text-body tablet:type-body-md">{entry.howItTurnedOut}</dd>
            </>
          )}
        </dl>
      ) : (
        <p className="flex flex-wrap items-center gap-x-sm type-body-md text-muted">
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
    </Card>
  );
}
