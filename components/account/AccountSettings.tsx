"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { Card } from "@/components/ui/Card";
import { readAlertsState, TimerAlertsSheet, type AlertsState } from "@/components/shell/TimerAlertsSheet";

// BONES-system.md 1.3.0, /account's Settings card: one glazed card, hairline rows,
// each 56px — Timer alerts (opens the Timer alerts sheet), Shortcut and import key
// (while the Import feature is on), Privacy.

const rowClass =
  "flex min-h-[56px] w-full items-center justify-between gap-md border-b border-hairline px-base text-left last:border-b-0 transition-colors duration-(--motion-fast) ease-skin hover:bg-surface-sunken active:bg-primary-wash focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus-ring";

function RowEnd({ children }: { children?: React.ReactNode }) {
  return (
    <span className="flex shrink-0 items-center gap-xs type-body-sm text-muted">
      {children}
      <ChevronRight aria-hidden="true" className="size-icon-sm text-muted" />
    </span>
  );
}

const ALERTS_LABEL: Record<AlertsState, string> = { "alerts-on": "On", denied: "Blocked", "alerts-off": "Off", "not-home-screen": "Off" };

export function AccountSettings({ importEnabled, className }: { importEnabled: boolean; className?: string }) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  // readAlertsState touches window/Notification — server snapshot is "Off", the
  // safe common-case default. No change event to subscribe to, so this reads once
  // per mount; `refreshed` (set when the sheet closes, in its own click-driven
  // handler, not an effect) overrides it once the owner has answered the prompt.
  const [refreshed, setRefreshed] = useState<AlertsState | null>(null);
  const mounted = useSyncExternalStore<AlertsState>(
    () => () => {},
    readAlertsState,
    () => "alerts-off",
  );
  const alertsState = refreshed ?? mounted;
  const button = useRef<HTMLButtonElement>(null);

  return (
    <div className={className}>
      <Card className="p-0">
        <button
          ref={button}
          type="button"
          className={rowClass}
          onClick={() => setAlertsOpen(true)}
        >
          <span className="type-body-md text-ink">Timer alerts</span>
          <RowEnd>{ALERTS_LABEL[alertsState]}</RowEnd>
        </button>
        {importEnabled && (
          <Link href="/import#set-up-the-shortcut" className={rowClass}>
            <span className="type-body-md text-ink">Shortcut and import key</span>
            <RowEnd />
          </Link>
        )}
        <Link href="/privacy" className={rowClass}>
          <span className="type-body-md text-ink">Privacy</span>
          <RowEnd />
        </Link>
      </Card>
      <TimerAlertsSheet
        open={alertsOpen}
        onClose={() => {
          setAlertsOpen(false);
          setRefreshed(readAlertsState());
        }}
        returnFocus={button}
      />
    </div>
  );
}
