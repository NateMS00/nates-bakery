"use client";

import type { RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { StarRating } from "@/components/ui/StarRating";

// BONES Rating prompt: after Mark as baked, only when unrated. Mobile bottom sheet,
// desktop modal 4 cols, both sized to their content. "How was it?" with a close X,
// 5 stars at SKIN's starSizePrompt (40px), centered, Skip directly below.
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
    <Dialog open={open} onClose={onClose} title="How was it?" modalColumns={4} returnFocus={returnFocus}>
      <StarRating
        value={null}
        prompt
        label="Rating"
        className="mt-sm justify-center"
        onChange={(n) => {
          if (n !== null) onRate(n);
        }}
      />
      <div className="mt-xs flex justify-center">
        <Button variant="text" onClick={onClose}>
          Skip
        </Button>
      </div>
    </Dialog>
  );
}
