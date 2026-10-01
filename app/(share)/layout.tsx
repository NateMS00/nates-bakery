import type { Metadata } from "next";
import { PublicShell } from "@/components/shell/PublicShell";

// Share area: public, gated only by the share token (SKELETON §3). proxy.ts doesn't
// match /r, so signed-out friends get straight in. Share links are private by intent,
// so these pages ask not to be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
