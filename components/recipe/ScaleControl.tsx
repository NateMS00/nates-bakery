"use client";

import { useEffect, useRef, useState } from "react";
import { ChoiceRadio } from "@/components/ui/ChoiceRadio";
import { TextField } from "@/components/ui/TextField";
import { SCALE_MAX, SCALE_MIN, SCALE_PRESETS, formatScale } from "@/lib/format";

// BONES Scale: presets ½×, 1×, 1.5×, 2×, and Custom, as choice radios in a fieldset
// named "Scale"; Custom reveals a number field in the same row (0.25× to 10×).

const isPreset = (n: number) => (SCALE_PRESETS as readonly number[]).includes(n);

export function ScaleControl({ scale, onChange }: { scale: number; onChange: (scale: number) => void }) {
  const [customOpen, setCustomOpen] = useState(!isPreset(scale));
  const [draft, setDraft] = useState(isPreset(scale) ? "" : String(scale));
  const [error, setError] = useState<string>();
  const field = useRef<HTMLInputElement>(null);
  const focusField = useRef(false);

  useEffect(() => {
    if (focusField.current) {
      focusField.current = false;
      field.current?.focus();
    }
  }, [customOpen]);

  function choose(value: string) {
    if (value === "custom") {
      focusField.current = true;
      setCustomOpen(true);
      setDraft(isPreset(scale) ? "" : String(scale));
      return;
    }
    setCustomOpen(false);
    setError(undefined);
    onChange(Number(value));
  }

  function commit() {
    if (draft.trim() === "") return;
    const n = Number(draft.replace(",", "."));
    if (!Number.isFinite(n) || n < SCALE_MIN || n > SCALE_MAX) {
      setError(`Enter a number from ${SCALE_MIN} to ${SCALE_MAX}`);
      return;
    }
    setError(undefined);
    onChange(Math.round(n * 100) / 100);
  }

  return (
    <ChoiceRadio
      legend="Scale"
      name="scale"
      value={customOpen ? "custom" : String(scale)}
      onChange={choose}
      options={SCALE_PRESETS.map((p) => ({ value: String(p), label: formatScale(p), ariaLabel: p === 0.5 ? "Half" : undefined })).concat({
        value: "custom",
        label: "Custom",
        ariaLabel: undefined,
      })}
    >
      {customOpen && (
        <form
          className="flex items-end"
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
        >
          <TextField
            ref={field}
            id="custom-scale"
            label="Custom scale"
            inputMode="decimal"
            autoComplete="off"
            amount
            suffix="×"
            value={draft}
            error={error}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            wrapperClassName="w-[calc(var(--spacing-3xl)*2)]"
          />
        </form>
      )}
    </ChoiceRadio>
  );
}
