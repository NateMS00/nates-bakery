import { newId, type EditorIngredient, type EditorState, type EditorStep } from "@/lib/data/editor";
import type { Group } from "@/lib/data/types";

// Pure edits on the Recipe Editor's state. Lists keep display order; a group's rows
// are the rows with its groupId, in list order.

export type Kind = "ingredient" | "step";
type Row = EditorIngredient | EditorStep;

const listKey = (kind: Kind) => (kind === "ingredient" ? "ingredients" : "steps") as "ingredients" | "steps";
const groupKey = (kind: Kind) => (kind === "ingredient" ? "ingredientGroups" : "stepGroups") as "ingredientGroups" | "stepGroups";

export function rowsOf(state: EditorState, kind: Kind): Row[] {
  return state[listKey(kind)];
}

function withRows(state: EditorState, kind: Kind, rows: Row[]): EditorState {
  return { ...state, [listKey(kind)]: rows };
}

/** Rows in display order: ungrouped first (only when there are no groups), then each group in order. */
export function blocks<T extends Row>(groups: Group[], rows: T[]): { group: Group | null; rows: T[] }[] {
  if (groups.length === 0) return [{ group: null, rows }];
  const known = new Set(groups.map((g) => g.id));
  const loose = rows.filter((r) => !r.groupId || !known.has(r.groupId));
  return [...(loose.length ? [{ group: null, rows: loose }] : []), ...groups.map((group) => ({ group, rows: rows.filter((r) => r.groupId === group.id) }))];
}

export function updateRow<T extends Row>(state: EditorState, kind: Kind, id: string, patch: Partial<T>): EditorState {
  return withRows(state, kind, rowsOf(state, kind).map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

/** Move up or down within its group. */
export function moveRow(state: EditorState, kind: Kind, id: string, dir: -1 | 1): EditorState {
  const rows = [...rowsOf(state, kind)];
  const i = rows.findIndex((r) => r.id === id);
  let j = i + dir;
  while (j >= 0 && j < rows.length && rows[j].groupId !== rows[i].groupId) j += dir;
  if (i < 0 || j < 0 || j >= rows.length) return state;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  return withRows(state, kind, rows);
}

export function canMove(state: EditorState, kind: Kind, id: string, dir: -1 | 1): boolean {
  return moveRow(state, kind, id, dir) !== state;
}

/** Move to the end of another group. */
export function moveRowToGroup(state: EditorState, kind: Kind, id: string, groupId: string): EditorState {
  const rows = rowsOf(state, kind);
  const row = rows.find((r) => r.id === id);
  if (!row) return state;
  return withRows(state, kind, [...rows.filter((r) => r.id !== id), { ...row, groupId }]);
}

export function addRow(state: EditorState, kind: Kind, groupId: string | null): { state: EditorState; id: string } {
  const id = newId(kind === "ingredient" ? "i" : "s");
  const row: Row =
    kind === "ingredient"
      ? { id, groupId, name: "", amount: "", toTaste: false, status: "confirmed" }
      : { id, groupId, text: "", ingredientIds: [] };
  const rows = rowsOf(state, kind);
  // Insert after the group's last row, so it appears at the end of that group.
  const lastIndex = rows.map((r) => r.groupId).lastIndexOf(groupId);
  const next = [...rows];
  next.splice(lastIndex === -1 ? rows.length : lastIndex + 1, 0, row);
  return { state: withRows(state, kind, next), id };
}

export interface Deleted {
  kind: Kind;
  row: Row;
  index: number;
  /** Steps that used a deleted ingredient, so Undo can link it again. */
  linkedStepIds: string[];
}

/** Delete a row; the returned record lets Undo put it back without losing later edits. */
export function deleteRow(state: EditorState, kind: Kind, id: string): { state: EditorState; deleted: Deleted | null } {
  const rows = rowsOf(state, kind);
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return { state, deleted: null };
  let next = withRows(state, kind, rows.filter((r) => r.id !== id));
  const linkedStepIds = kind === "ingredient" ? state.steps.filter((s) => s.ingredientIds.includes(id)).map((s) => s.id) : [];
  if (kind === "ingredient") next = { ...next, steps: next.steps.map((s) => ({ ...s, ingredientIds: s.ingredientIds.filter((x) => x !== id) })) };
  return { state: next, deleted: { kind, row: rows[index], index, linkedStepIds } };
}

export function restoreRow(state: EditorState, d: Deleted): EditorState {
  const rows = [...rowsOf(state, d.kind)];
  rows.splice(Math.min(d.index, rows.length), 0, d.row);
  let next = withRows(state, d.kind, rows);
  if (d.kind === "ingredient") {
    next = { ...next, steps: next.steps.map((s) => (d.linkedStepIds.includes(s.id) ? { ...s, ingredientIds: [...s.ingredientIds, d.row.id] } : s)) };
  }
  return next;
}

/** Add a group at the end. The first group takes over the existing ungrouped rows. */
export function addGroup(state: EditorState, kind: Kind, name: string): EditorState {
  const group: Group = { id: newId(kind === "ingredient" ? "ig" : "sg"), name: name.trim() };
  const groups = state[groupKey(kind)];
  let next: EditorState = { ...state, [groupKey(kind)]: [...groups, group] };
  if (groups.length === 0) next = withRows(next, kind, rowsOf(next, kind).map((r) => ({ ...r, groupId: group.id })));
  return next;
}

export function renameGroup(state: EditorState, kind: Kind, groupId: string, name: string): EditorState {
  return { ...state, [groupKey(kind)]: state[groupKey(kind)].map((g) => (g.id === groupId ? { ...g, name } : g)) };
}

export function moveGroup(state: EditorState, kind: Kind, groupId: string, dir: -1 | 1): EditorState {
  const groups = [...state[groupKey(kind)]];
  const i = groups.findIndex((g) => g.id === groupId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= groups.length) return state;
  [groups[i], groups[j]] = [groups[j], groups[i]];
  return { ...state, [groupKey(kind)]: groups };
}

/** Delete a group but keep its rows: they join the previous group (or the next, or none). */
export function deleteGroup(state: EditorState, kind: Kind, groupId: string): EditorState {
  const groups = state[groupKey(kind)];
  const i = groups.findIndex((g) => g.id === groupId);
  const rest = groups.filter((g) => g.id !== groupId);
  const heir = rest[Math.max(0, i - 1)]?.id ?? null;
  const next: EditorState = { ...state, [groupKey(kind)]: rest };
  return withRows(next, kind, rowsOf(next, kind).map((r) => (r.groupId === groupId ? { ...r, groupId: heir } : r)));
}
