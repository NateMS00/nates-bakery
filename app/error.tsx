"use client";

import { PublicShell } from "@/components/shell/PublicShell";
import { ErrorContent } from "@/components/system/ErrorContent";

// Fallback for errors outside the App and Share areas (Bake Mode, the auth pages):
// the public shell, which needs no session, and a link to / (owner → /recipes, others
// → /login).
export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PublicShell>
      <ErrorContent reset={reset} back={{ href: "/", label: "Go to Backery" }} />
    </PublicShell>
  );
}
