"use client";

import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

// BONES-shell Timer alerts sheet (SKELETON FLOW-05). Its content depends on where
// the app stands. Scheduling alerts on the server is STUBBED until the backend
// exists; this sheet only asks the browser for permission.

export type AlertsState = "not-home-screen" | "alerts-off" | "alerts-on" | "denied";

/** Where timer alerts stand on this device (not on the Home Screen, off, on, denied). */
export function readAlertsState(): AlertsState {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (!standalone || !("Notification" in window)) return "not-home-screen";
  if (Notification.permission === "granted") return "alerts-on";
  if (Notification.permission === "denied") return "denied";
  return "alerts-off";
}

const TITLE = "Get timer alerts on a locked phone";

export function TimerAlertsSheet({
  open,
  onClose,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement | null>;
}) {
  // Only opens after a tap, so reading the browser in render is safe (never on the server).
  const [answered, setAnswered] = useState<AlertsState | null>(null);
  const state: AlertsState = open ? (answered ?? readAlertsState()) : "not-home-screen";

  async function turnOn() {
    const result = await Notification.requestPermission();
    setAnswered(result === "granted" ? "alerts-on" : result === "denied" ? "denied" : "alerts-off");
  }

  const title = state === "alerts-on" ? "Timer alerts are on" : state === "denied" ? "Alerts are blocked" : TITLE;

  return (
    <Dialog open={open} onClose={onClose} title={title} modalColumns={5} returnFocus={returnFocus}>
      <div className="mt-sm type-body-md text-body">
        {state === "not-home-screen" && (
          <>
            <p>iPhone only sends alerts to apps on your Home Screen.</p>
            <ol className="mt-base flex flex-col gap-md">
              {["Tap Share in Safari", "Choose Add to Home Screen", "Open Backery from the new icon"].map((text, i) => (
                <li key={text} className="flex items-baseline gap-md text-ink">
                  <span className="min-w-[2ch] type-amount font-bold text-primary">{i + 1}</span>
                  {text}
                </li>
              ))}
            </ol>
          </>
        )}
        {state === "alerts-off" && <p>iPhone only sends alerts to apps on your Home Screen. Backery is there, so you can turn them on.</p>}
        {state === "alerts-on" && <p>Timers will alert you even when the phone is locked or another app is open.</p>}
        {state === "denied" && (
          <p>
            To allow them, open the iPhone&rsquo;s Settings, tap Notifications, choose Backery, and turn on Allow Notifications.
            Timers still alert while Bake Mode is on screen.
          </p>
        )}
        {state === "alerts-off" && (
          <Button variant="primary" onClick={turnOn} data-autofocus className="mt-lg w-full tablet:w-auto">
            Turn on alerts
          </Button>
        )}
      </div>
    </Dialog>
  );
}
