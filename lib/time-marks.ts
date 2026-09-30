import type { TimeMark } from "./data/types";

export type StepPart = { kind: "text"; text: string } | { kind: "time"; text: string; mark: TimeMark };

/** Splits step text around its detected times, in order, so they can be marked inline. */
export function splitStepText(text: string, marks: TimeMark[]): StepPart[] {
  const parts: StepPart[] = [];
  let rest = text;
  for (const mark of marks) {
    const at = rest.indexOf(mark.text);
    if (at === -1) continue;
    if (at > 0) parts.push({ kind: "text", text: rest.slice(0, at) });
    parts.push({ kind: "time", text: mark.text, mark });
    rest = rest.slice(at + mark.text.length);
  }
  if (rest) parts.push({ kind: "text", text: rest });
  return parts;
}
