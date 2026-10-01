import { notFound } from "next/navigation";
import { importEnabled } from "@/lib/features";

// /import and /import/:draftId exist only with BACKERY_FEATURE_IMPORT=on; otherwise
// they're Not found, and nothing in the app links to them (lib/features.ts).
export default function ImportLayout({ children }: { children: React.ReactNode }) {
  if (!importEnabled()) notFound();
  return children;
}
