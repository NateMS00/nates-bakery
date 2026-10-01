"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
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
// opens the entry form at ?new=1, which Bake Mode's Finish also links to.

const PAGE = 20;

type FormState = { mode: "new" } | { mode: "edit"; entry: BakeLogEntry };

const headingId = (entryId: string) => `bake-${entryId}`;

export function BakeLogView({ initial }: { initial: Recipe }) {
  const { recipe, actions } = useOwnerRecipe(initial);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const { scale: bakedScale } = parseScale(searchParams.get("scale") ?? undefined);

  const [editing, setEditing] = useState<BakeLogEntry | null>(null);
  const [session, setSession] = useState(0);
  const [lastNewUrl, setLastNewUrl] = useState(false);
  // ?new=1 arriving (from Log a bake or Bake Mode's Finish) starts a fresh form.
  if (isNew !== lastNewUrl) {
    setLastNewUrl(isNew);
    if (isNew) {
      setEditing(null);
      setSession((s) => s + 1);
    }
  }
  const form: FormState | null = editing ? { mode: "edit", entry: editing } : isNew ? { mode: "new" } : null;

  const [shown, setShown] = useState(PAGE);
  const [deleting, setDeleting] = useState<BakeLogEntry | null>(null);
  const [rateAfterClose, setRateAfterClose] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const list = useRef<HTMLUListElement>(null);
  const logButton = useRef<HTMLAnchorElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  /** Where focus returns after the form, decided when it opens (Edit: its opener, or the entry if the opener is gone). */
  const formReturn = useRef<{ opener: HTMLElement | null; entryId: string } | null>(null);
  /** Set once a bake is deleted: the heading to focus next, or null for the H1 (the log is empty). */
  const afterDelete = useRef<{ id: string | null } | null>(null);

  const entries = recipe.bakeLog;

  function closeForm() {
    setEditing(null);
    if (isNew) router.replace(pathname, { scroll: false });
  }

  function openEdit(entry: BakeLogEntry) {
    formReturn.current = { opener: document.activeElement as HTMLElement | null, entryId: entry.id };
    setEditing(entry);
    setSession((s) => s + 1);
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
    setAnnouncement(`Bake on ${formatBakeDate(fields.date)} saved`);
    closeForm();
    return true;
  }

  function finishNew() {
    setRatingOpen(false);
    setHighlightId(newEntryId);
    setAnnouncement("Bake logged");
  }

  async function confirmDelete() {
    if (!deleting) return;
    const i = entries.findIndex((e) => e.id === deleting.id);
    const neighbour = entries[i + 1] ?? entries[i - 1];
    afterDelete.current = { id: neighbour ? headingId(neighbour.id) : null };
    await actions.removeBake(deleting.id);
    setAnnouncement("Bake deleted");
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
            className="fixed inset-x-0 bottom-0 z-20 bg-canvas px-(--gutter) pt-md pb-[calc(var(--spacing-md)+env(safe-area-inset-bottom))] shadow-bar tablet:static tablet:z-auto tablet:shrink-0 tablet:bg-transparent tablet:p-0 tablet:shadow-none"
          >
            <ButtonLink ref={logButton} href={`${pathname}?new=1`} replace scroll={false} variant="primary" className="w-full tablet:w-auto">
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
                  onEdit={() => openEdit(entry)}
                  onDelete={() => setDeleting(entry)}
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
          const edited = formReturn.current;
          formReturn.current = null;
          if (edited) return edited.opener?.isConnected ? edited.opener : document.getElementById(headingId(edited.entryId));
          return logButton.current;
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
          afterDelete.current = null;
          if (!target) return null;
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
  onEdit,
  onDelete,
}: {
  entry: BakeLogEntry;
  highlighted: boolean;
  onHighlightEnd: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
          <Button variant="text" onClick={onEdit} aria-label={`Add notes, ${date} bake`} className="-ml-sm">
            Add notes
          </Button>
        </p>
      )}
    </Card>
  );
}
