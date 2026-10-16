"use client";

import { usePathname } from "next/navigation";
import { TABLET_UP, useMediaQuery } from "@/components/ui/useMediaQuery";
import { BottomNav, TOP_LEVEL } from "./BottomNav";
import { SiteFooter } from "./SiteFooter";
import { useInstalled } from "./useInstalled";

/**
 * BONES-shell 1.7.0: installed mode on a mobile top-level page gets the tab bar
 * and no footer ("Privacy lives on the Account page"); everything else — tablet
 * and desktop always, mobile Safari, and any detail/task page — keeps the usual
 * Privacy footer. A desktop install (Chrome/Edge support this too) still keeps
 * the top header's own nav, not a tab bar, so it must not lose the footer here.
 */
export function ShellFooter({ showImport }: { showImport: boolean }) {
  const pathname = usePathname();
  const installed = useInstalled();
  const mobile = !useMediaQuery(TABLET_UP);
  return installed && mobile && pathname in TOP_LEVEL ? <BottomNav showImport={showImport} /> : <SiteFooter />;
}
