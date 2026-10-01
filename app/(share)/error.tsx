"use client";

import { ErrorContent } from "@/components/system/ErrorContent";

// Errors on shared pages keep the Share shell. No link back: shared pages lead nowhere
// in the app (SKELETON), so retrying is the only way forward.
export default function ShareError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorContent reset={reset} />;
}
