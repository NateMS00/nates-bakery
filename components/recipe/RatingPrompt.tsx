"use client";

import type { RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { StarRating } from "@/components/ui/StarRating";

// BONES Rating prompt: after Mark as baked, only when unrated. Mobile bottom sheet
// (about a third of the viewport), desktop modal 4 cols. "How was it?", 5 stars, Skip.
// Choosing a star saves and closes. Focus starts on the first star and returns
// to Mark as baked.

export function RatingPrompt({
  open,
  onRate,
  onClose,
  returnFocus,
}: {
  open: boolean;
  onRate: (rating: number) => void;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="How was it?" sheetHeight="third" modalColumns={4} returnFocus={returnFocus}>
      <StarRating
        value={null}
        prompt
        label="Rating"
        className="mt-sm pl-[calc((var(--spacing-touch-min)-22px)/2)]"
        onChange={(n) => {
          if (n !== null) onRate(n);
        }}
      />
      <div className="mt-auto flex pt-base">
        <Button variant="text" onClick={onClose} className="-ml-sm">
          Skip
        </Button>
      </div>
    </Dialog>
  );
}
