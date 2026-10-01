"use client";

import { Plus, Timer } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/Button";
import { InlineConfirmation } from "@/components/ui/InlineConfirmation";
import { ConvertedLabel, EstimatedMarker, MissingMarker, SuggestedMarker } from "@/components/ui/Marker";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { cx } from "@/components/ui/cx";
import { CATEGORIES } from "@/lib/data/categories";
import {
  GROUP_SUGGESTIONS,
  amountFieldId,
  detectTimes,
  formatTimeChip,
  isMissing,
  nameFieldId,
  stepGroupSuggestions,
  type EditorIngredient,
  type EditorState,
  type EditorStep,
} from "@/lib/data/editor";
import type { Category, Group } from "@/lib/data/types";
import { ActionMenu, type MenuAction } from "./ActionMenu";
import { GroupPicker } from "./GroupPicker";
import { IngredientsUsedPicker } from "./IngredientsUsedPicker";
import {
  addGroup,
  addRow,
  blocks,
  canMove,
  deleteGroup,
  deleteRow,
  moveGroup,
  moveRow,
  moveRowToGroup,
  renameGroup,
  restoreRow,
  updateRow,
  type Deleted,
  type Kind,
} from "./ops";

// BONES Recipe Editor (shared by Review Import, New Recipe, Edit Recipe): Details,
// Ingredients, Steps. `errors` holds the field ids to mark after a blocked save.

type SetState = Dispatch<SetStateAction<EditorState>>;

export function RecipeEditor({ state, setState, errors }: { state: EditorState; setState: SetState; errors: Set<string> }) {
  const [undo, setUndo] = useState<{ kind: Kind; deleted: Deleted; label: string } | null>(null);
  const focusAfter = useRef<string | null>(null);

  useEffect(() => {
    if (focusAfter.current) {
      document.getElementById(focusAfter.current)?.focus();
      focusAfter.current = null;
    }
  });

  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 10_000);
    return () => window.clearTimeout(t);
  }, [undo]);

  function remove(kind: Kind, id: string, label: string) {
    const result = deleteRow(state, kind, id);
    if (!result.deleted) return;
    setState(result.state);
    setUndo({ kind, deleted: result.deleted, label });
  }

  function add(kind: Kind, groupId: string | null) {
    const result = addRow(state, kind, groupId);
    setState(result.state);
    focusAfter.current = kind === "ingredient" ? nameFieldId(result.id) : `step-${result.id}`;
  }

  const undoLine = (kind: Kind) =>
    undo?.kind === kind && (
      <InlineConfirmation className="mt-sm">
        <span>
          Deleted {undo.label} <span aria-hidden="true">·</span>
        </span>
        <Button
          variant="text"
          className="-my-md -ml-sm"
          onClick={() => {
            setState((s) => restoreRow(s, undo.deleted));
            setUndo(null);
          }}
        >
          Undo
        </Button>
      </InlineConfirmation>
    );

  return (
    <section aria-labelledby="editor-heading">
      <SectionHeading id="editor-heading">Recipe</SectionHeading>

      <Details state={state} setState={setState} errors={errors} />

      {/* Ingredients */}
      <h3 className="mt-xl type-heading text-ink">Ingredients</h3>
      <div className="mt-sm flex flex-col gap-base">
        {blocks(state.ingredientGroups, state.ingredients).map(({ group, rows }) => (
          <GroupBlock key={group?.id ?? "none"} kind="ingredient" group={group} state={state} setState={setState} label="Ingredients">
            <ul role="list">
              {rows.map((ingredient, i) => (
                <IngredientRow
                  key={ingredient.id}
                  index={state.ingredients.indexOf(ingredient) + 1}
                  ingredient={ingredient}
                  first={i === 0}
                  state={state}
                  setState={setState}
                  error={errors.has(amountFieldId(ingredient.id))}
                  onDelete={() => remove("ingredient", ingredient.id, ingredient.name.trim() || "ingredient")}
                />
              ))}
            </ul>
            <Button variant="text" onClick={() => add("ingredient", group?.id ?? null)} className="mt-xs -ml-sm self-start">
              <Plus aria-hidden="true" />
              Add ingredient
              {group && <span className="sr-only"> to {group.name}</span>}
            </Button>
          </GroupBlock>
        ))}
      </div>
      {undoLine("ingredient")}
      <div className="mt-sm">
        <GroupPicker
          buttonLabel="Add ingredient group"
          title="Add ingredient group"
          suggestions={GROUP_SUGGESTIONS}
          existing={state.ingredientGroups.map((g) => g.name)}
          onAdd={(name) => setState((s) => addGroup(s, "ingredient", name))}
        />
      </div>

      {/* Steps */}
      <h3 className="mt-xl type-heading text-ink">Steps</h3>
      <div className="mt-sm flex flex-col gap-base">
        {blocks(state.stepGroups, state.steps).map(({ group, rows }) => (
          <GroupBlock key={group?.id ?? "none"} kind="step" group={group} state={state} setState={setState} label="Steps">
            <ol role="list">
              {rows.map((step) => (
                <StepRow
                  key={step.id}
                  number={state.steps.indexOf(step) + 1}
                  step={step}
                  state={state}
                  setState={setState}
                  onDelete={() => remove("step", step.id, `step ${state.steps.indexOf(step) + 1}`)}
                />
              ))}
            </ol>
            <Button variant="text" onClick={() => add("step", group?.id ?? null)} className="mt-xs -ml-sm self-start">
              <Plus aria-hidden="true" />
              Add step
              {group && <span className="sr-only"> to {group.name}</span>}
            </Button>
          </GroupBlock>
        ))}
      </div>
      {undoLine("step")}
      <div className="mt-sm">
        <GroupPicker
          buttonLabel="Add step group"
          title="Add step group"
          suggestions={stepGroupSuggestions(state)}
          existing={state.stepGroups.map((g) => g.name)}
          onAdd={(name) => setState((s) => addGroup(s, "step", name))}
        />
      </div>
    </section>
  );
}

// ── Details ──

function Details({ state, setState, errors }: { state: EditorState; setState: SetState; errors: Set<string> }) {
  const set = (patch: Partial<EditorState>) => setState((s) => ({ ...s, ...patch }));
  return (
    <div className="mt-base">
      <h3 className="type-heading text-ink">Details</h3>
      <div className="mt-sm grid gap-base tablet:grid-cols-2">
        <TextField
          id="editor-title"
          label="Title"
          value={state.title}
          onChange={(e) => set({ title: e.target.value })}
          error={errors.has("editor-title") ? "Enter a title" : undefined}
          wrapperClassName="tablet:col-span-2"
          className="scroll-mt-3xl"
        />
        <Select
          id="editor-category"
          label={
            <span className="inline-flex items-center gap-sm">
              Category {state.categorySuggested && state.category && <SuggestedMarker />}
            </span>
          }
          value={state.category}
          onChange={(e) => set({ category: e.target.value as Category, categorySuggested: false })}
          error={errors.has("editor-category") ? "Choose a category" : undefined}
          className="scroll-mt-3xl"
        >
          <option value="">Choose a category</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-sm">
          <TextField id="editor-yield" label="Yield" inputMode="numeric" value={state.yieldQuantity} onChange={(e) => set({ yieldQuantity: e.target.value })} autoComplete="off" />
          <TextField id="editor-yield-unit" label="Unit" placeholder="cookies" value={state.yieldUnit} onChange={(e) => set({ yieldUnit: e.target.value })} autoComplete="off" />
        </div>
        <fieldset className="flex flex-col gap-xs">
          <legend className="type-label text-muted">Total time</legend>
          <div className="mt-xs grid grid-cols-2 gap-sm">
            <TextField id="editor-hours" label={<span className="sr-only">Hours</span>} inputMode="numeric" suffix="h" value={state.hours} onChange={(e) => set({ hours: e.target.value })} autoComplete="off" wrapperClassName="gap-0" />
            <TextField id="editor-minutes" label={<span className="sr-only">Minutes</span>} inputMode="numeric" suffix="min" value={state.minutes} onChange={(e) => set({ minutes: e.target.value })} autoComplete="off" wrapperClassName="gap-0" />
          </div>
        </fieldset>
        <TextField id="editor-source" label="Source link" type="url" inputMode="url" value={state.sourceUrl} onChange={(e) => set({ sourceUrl: e.target.value })} autoComplete="off" />
      </div>
    </div>
  );
}

// ── Group block ──

function GroupBlock({
  kind,
  group,
  state,
  setState,
  label,
  children,
}: {
  kind: Kind;
  group: Group | null;
  state: EditorState;
  setState: SetState;
  label: string;
  children: React.ReactNode;
}) {
  const groups = kind === "ingredient" ? state.ingredientGroups : state.stepGroups;
  const i = group ? groups.findIndex((g) => g.id === group.id) : -1;
  const [renaming, setRenaming] = useState(false);
  const Tag = group ? "fieldset" : "div";
  return (
    <Tag className="flex min-w-0 flex-col rounded-lg border border-hairline bg-surface-card px-base pt-sm pb-xs" aria-label={group ? undefined : label}>
      {group && <legend className="sr-only">{group.name}</legend>}
      {group && (
        <div className="-mr-sm flex items-center gap-sm border-b border-hairline pb-xs">
          {renaming ? (
            <input
              suppressHydrationWarning
              aria-label="Group name"
              autoFocus
              defaultValue={group.name}
              onBlur={(e) => {
                setState((s) => renameGroup(s, kind, group.id, e.target.value.trim() || group.name));
                setRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="min-h-touch-min min-w-0 flex-1 rounded-md border border-border bg-surface-card px-sm type-subheading text-primary focus-visible:outline-offset-1"
            />
          ) : (
            <span aria-hidden="true" className="flex-1 type-subheading text-primary">
              {group.name}
            </span>
          )}
          <ActionMenu
            label={`Group menu, ${group.name}`}
            title={group.name}
            items={[
              { label: "Rename", onSelect: () => setRenaming(true) },
              { label: "Move up", disabled: i <= 0, onSelect: () => setState((s) => moveGroup(s, kind, group.id, -1)) },
              { label: "Move down", disabled: i === groups.length - 1, onSelect: () => setState((s) => moveGroup(s, kind, group.id, 1)) },
              { label: "Delete group", destructive: true, onSelect: () => setState((s) => deleteGroup(s, kind, group.id)) },
            ]}
          />
        </div>
      )}
      {children}
    </Tag>
  );
}

function rowActions(state: EditorState, setState: SetState, kind: Kind, id: string, groupId: string | null, onDelete: () => void, extra: MenuAction[] = []): MenuAction[] {
  const groups = kind === "ingredient" ? state.ingredientGroups : state.stepGroups;
  const others = groups.filter((g) => g.id !== groupId);
  return [
    { label: "Move up", disabled: !canMove(state, kind, id, -1), onSelect: () => setState((s) => moveRow(s, kind, id, -1)) },
    { label: "Move down", disabled: !canMove(state, kind, id, 1), onSelect: () => setState((s) => moveRow(s, kind, id, 1)) },
    ...(others.length
      ? [{ label: "Move to group", submenu: { title: "Move to group", items: others.map((g) => ({ label: g.name, onSelect: () => setState((s) => moveRowToGroup(s, kind, id, g.id)) })) } }]
      : []),
    ...extra,
    { label: "Delete", destructive: true, onSelect: onDelete },
  ];
}

// ── Ingredient row ──

function IngredientRow({
  index,
  ingredient,
  first,
  state,
  setState,
  error,
  onDelete,
}: {
  index: number;
  ingredient: EditorIngredient;
  first: boolean;
  state: EditorState;
  setState: SetState;
  error: boolean;
  onDelete: () => void;
}) {
  const set = (patch: Partial<EditorIngredient>) => setState((s) => updateRow(s, "ingredient", ingredient.id, patch));
  const missing = isMissing(ingredient);
  const name = ingredient.name.trim() || `ingredient ${index}`;
  const errorId = `${amountFieldId(ingredient.id)}-error`;
  const flagged = !ingredient.toTaste && !missing && ingredient.status !== "confirmed";

  const hasStatus = missing || flagged || ingredient.toTaste;

  // Mobile and tablet: name, amount, menu on one line; a second line only when there's
  // something to act on. Desktop (1280 up): fixed columns so the grams line up down
  // every group: name | amount | status area (reserved, empty when clean) | menu.
  return (
    <li className={cx("py-sm", !first && "border-t border-hairline")}>
      <div className="grid grid-cols-[minmax(0,1fr)_calc(var(--spacing-3xl)*1.5)_var(--spacing-touch-min)] items-start gap-x-sm gap-y-xs desktop:grid-cols-[minmax(0,1fr)_calc(var(--spacing-3xl)*2)_calc(var(--spacing-3xl)*3.5)_var(--spacing-touch-min)]">
        <NameField id={nameFieldId(ingredient.id)} label={`Ingredient ${index}, name`} value={ingredient.name} onChange={(name) => set({ name })} />
        {ingredient.toTaste ? (
          <span className="inline-flex min-h-control-height items-center justify-end type-body-md text-muted">To taste</span>
        ) : (
          <div
            className={cx(
              "flex min-h-control-height items-center rounded-md border border-border bg-surface-card px-md text-ink hover:border-ink focus-within:border-primary focus-within:outline-3 focus-within:outline-offset-1 focus-within:outline-focus-ring",
              error && "border-2 border-error! bg-error-wash hover:border-error",
            )}
          >
            <input
              suppressHydrationWarning
              id={amountFieldId(ingredient.id)}
              aria-label={`${name}, grams`}
              aria-invalid={error || undefined}
              aria-describedby={error ? errorId : undefined}
              inputMode="decimal"
              autoComplete="off"
              value={ingredient.amount}
              placeholder="—"
              onChange={(e) => set({ amount: e.target.value, status: "confirmed" })}
              className="min-w-0 flex-1 scroll-mt-3xl scroll-mb-[calc(var(--spacing-3xl)*2)] self-stretch bg-transparent text-right type-amount outline-none placeholder:text-muted"
            />
            <span className="ml-[3px] type-body-md text-muted">g</span>
          </div>
        )}
        {hasStatus && (
          <div className="col-span-3 row-start-2 flex flex-wrap items-center gap-xs desktop:col-span-1 desktop:col-start-3 desktop:row-start-1 desktop:min-h-control-height desktop:justify-between desktop:gap-sm">
            {missing && <MissingMarker />}
            {flagged && ingredient.status === "estimated" && <EstimatedMarker />}
            {flagged && ingredient.status === "converted" && <ConvertedLabel />}
            {flagged && (
              <Button variant="secondary" onClick={() => set({ status: "confirmed" })} className="px-md desktop:px-base">
                Confirm<span className="sr-only"> {name}</span>
              </Button>
            )}
            {(missing || ingredient.toTaste) && (
              <Toggle label="To taste" spoken={`To taste, ${name}`} checked={ingredient.toTaste} onChange={(toTaste) => set({ toTaste, amount: toTaste ? "" : ingredient.amount })} />
            )}
          </div>
        )}
        <div className="col-start-3 row-start-1 desktop:col-start-4">
          <ActionMenu
            label={`More actions, ${name}`}
            title={name}
            items={rowActions(state, setState, "ingredient", ingredient.id, ingredient.groupId, onDelete, [
              ingredient.toTaste
                ? { label: "Use an amount", onSelect: () => set({ toTaste: false }) }
                : { label: "Mark as to taste", onSelect: () => set({ toTaste: true, amount: "" }) },
            ])}
          />
        </div>
      </div>
      {error && (
        <p id={errorId} className="mt-xs type-body-sm text-error">
          Enter an amount, or mark it to taste
        </p>
      )}
      {flagged && ingredient.status === "converted" && ingredient.original && (
        <p id={`${ingredient.id}-original`} className="mt-xs type-caption text-muted">
          was {ingredient.original}
        </p>
      )}
    </li>
  );
}

/**
 * The ingredient name: grows with its content instead of truncating, so the full name
 * is always readable on a phone. One line of text in a 48px box; Enter doesn't add a
 * line break.
 */
function NameField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      id={id}
      aria-label={label}
      rows={1}
      placeholder="Ingredient"
      value={value}
      autoComplete="off"
      onChange={(e) => onChange(e.target.value.replace(/\s*\n\s*/g, " "))}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      className="block min-h-control-height min-w-0 resize-none overflow-hidden rounded-md border border-border bg-surface-card px-base py-[calc((var(--spacing-control-height)-2px-1.55em)/2)] type-body-md text-ink placeholder:text-muted hover:border-ink focus-visible:border-primary focus-visible:outline-offset-1"
    />
  );
}

// ── Step row ──

const USES_LIMIT = 6;

function StepRow({ number, step, state, setState, onDelete }: { number: number; step: EditorStep; state: EditorState; setState: SetState; onDelete: () => void }) {
  const [picking, setPicking] = useState(false);
  const edit = useRef<HTMLButtonElement>(null);
  const times = detectTimes(step.text);
  const used = step.ingredientIds.map((id) => state.ingredients.find((i) => i.id === id)).filter((i): i is EditorIngredient => Boolean(i?.name.trim()));
  const shownNames = used.slice(0, USES_LIMIT).map((i) => i.name.trim());

  return (
    <li className="border-t border-hairline py-sm first:border-t-0">
      <div className="grid grid-cols-[minmax(2ch,1fr)_auto] items-start gap-x-sm gap-y-xs tablet:grid-cols-[minmax(2ch,auto)_minmax(0,1fr)_auto]">
        <span className="pt-md type-amount font-bold text-primary">{number}</span>
        <div className="col-span-2 row-start-2 tablet:col-span-1 tablet:col-start-2 tablet:row-start-1">
          <Textarea id={`step-${step.id}`} aria-label={`Step ${number}`} value={step.text} onChange={(e) => setState((s) => updateRow(s, "step", step.id, { text: e.target.value }))} />
          {times.length > 0 && (
            <div className="mt-sm flex flex-wrap items-center gap-sm">
              <span className="sr-only">Detected times:</span>
              {times.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-xs rounded-sm border border-hairline px-sm py-xs type-caption font-bold text-primary">
                  <Timer aria-hidden="true" className="size-icon-sm" strokeWidth={2} />
                  {formatTimeChip(t.minutes)}
                </span>
              ))}
            </div>
          )}
          <div className="relative mt-xs flex items-start gap-sm">
            <p className="line-clamp-2 flex-1 pt-md type-body-sm text-body">
              <span className="font-bold">Uses:</span>{" "}
              {used.length ? (
                <>
                  {shownNames.join(", ")}
                  {used.length > USES_LIMIT && ` +${used.length - USES_LIMIT}`}
                </>
              ) : (
                <span className="text-muted">No ingredients</span>
              )}
            </p>
            <Button ref={edit} variant="text" aria-haspopup="dialog" aria-expanded={picking} onClick={() => setPicking((v) => !v)} className="min-w-touch-min shrink-0">
              Edit<span className="sr-only"> ingredients for step {number}</span>
            </Button>
            <IngredientsUsedPicker
              open={picking}
              onClose={() => setPicking(false)}
              anchor={edit}
              state={state}
              step={step}
              number={number}
              onToggle={(id, on) =>
                setState((s) =>
                  updateRow(s, "step", step.id, {
                    ingredientIds: on ? [...s.steps.find((x) => x.id === step.id)!.ingredientIds, id] : s.steps.find((x) => x.id === step.id)!.ingredientIds.filter((x) => x !== id),
                  }),
                )
              }
            />
          </div>
        </div>
        <div className="col-start-2 row-start-1 justify-self-end tablet:col-start-3">
          <ActionMenu label={`More actions, step ${number}`} title={`Step ${number}`} items={rowActions(state, setState, "step", step.id, step.groupId, onDelete)} />
        </div>
      </div>
    </li>
  );
}
