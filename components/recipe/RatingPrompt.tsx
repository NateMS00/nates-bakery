"use client";

import { Button } from "@/components/ui/Button";
import { Dialog, type FocusTarget } from "@/components/ui/Dialog";
import { StarRating } from "@/components/ui/StarRating";

// BONES Rating prompt (Recipe page and Bake Log): mobile bottom sheet, desktop modal
// 4 cols, both sized to their content. A title with a close X, 5 stars at SKIN's
// starSizePrompt (40px), centered, Skip directly below. Choosing a star saves and
// closes. Focus starts on the first star, or on the current rating when there is one
// (the Bake Log shows it so it can be kept or changed), and returns to the opener.

export function RatingPrompt({
  open,
  onRate,
  onClose,
  returnFocus,
  title = "How was it?",
  value = null,
}: {
  open: boolean;
  onRate: (rating: number) => void;
  onClose: () => void;
  returnFocus: FocusTarget;
  title?: string;
  value?: number | null;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} modalColumns={4} returnFocus={returnFocus}>
      <StarRating
        value={value}
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
