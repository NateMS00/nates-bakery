"use client";

import { ErrorContent } from "@/components/system/ErrorContent";

// Errors in the owner area keep the App shell (this boundary sits inside its layout).
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorContent reset={reset} back={{ href: "/recipes", label: "Go to your recipes" }} />;
}
