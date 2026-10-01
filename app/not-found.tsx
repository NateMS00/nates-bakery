import { SystemShell } from "@/components/shell/SystemShell";
import type { Metadata } from "next";
import { NotFoundContent } from "@/components/system/NotFoundContent";

// Unknown routes outside the app area: the App shell for the owner, the public shell
// otherwise, so a guest never sees owner navigation.
// WCAG 2.4.2: a title that says what happened.
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <SystemShell>
      <NotFoundContent />
    </SystemShell>
  );
}
