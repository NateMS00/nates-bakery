"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playChime, unlockAudio } from "./chime";

// Bake Mode timers (SKELETON section 2, BONES Timers): several run together, across
// steps, and survive a refresh because each is kept as an end time, not a counter.
// STUB: kept in this browser's storage per recipe; SKELETON has them saved on the
// server (so locked-phone alerts can be scheduled) once there's a backend.

export interface Timer {
  id: string;
  /** Which detected time started it: `${stepId}:${index}`, so it can't run twice at once. */
  source: string;
  label: string;
  durationMs: number;
  /** Set while running. */
  endsAt: number | null;
  /** Set while paused. */
  remainingMs: number | null;
  /** Set once it reaches zero; it stays (00:00) until dismissed. */
  finishedAt: number | null;
}

const key = (recipeId: string) => `backery.timers.${recipeId}`;

function read(recipeId: string): Timer[] {
  try {
    const raw = window.localStorage.getItem(key(recipeId));
    return raw ? (JSON.parse(raw) as Timer[]) : [];
  } catch {
    return [];
  }
}

function write(recipeId: string, timers: Timer[]) {
  try {
    if (timers.length) window.localStorage.setItem(key(recipeId), JSON.stringify(timers));
    else window.localStorage.removeItem(key(recipeId));
  } catch {
    /* Storage unavailable (private mode): timers still work until a refresh. */
  }
}

export function remainingMs(t: Timer, now: number): number {
  if (t.finishedAt) return 0;
  if (t.endsAt !== null) return Math.max(0, t.endsAt - now);
  return t.remainingMs ?? t.durationMs;
}

export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** "25 minutes", "1 hour 5 minutes", for announcements. */
export function spokenDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  return [h && part(h, "hour"), m && part(m, "minute")].filter(Boolean).join(" ") || "less than a minute";
}

export function useTimers(recipeId: string) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [announcement, setAnnouncement] = useState("");
  const loaded = useRef(false);

  // Load after mount (storage isn't available on the server).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage once on mount
    setTimers(read(recipeId));
    loaded.current = true;
  }, [recipeId]);

  useEffect(() => {
    if (loaded.current) write(recipeId, timers);
  }, [recipeId, timers]);

  // Tick while anything runs; finish timers that reach zero (the chime plays once,
  // outside the state update).
  const latest = useRef(timers);
  useEffect(() => {
    latest.current = timers;
  }, [timers]);
  const running = timers.some((t) => t.endsAt !== null && !t.finishedAt);
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const at = Date.now();
      setNow(at);
      const done = new Set(latest.current.filter((t) => t.endsAt !== null && !t.finishedAt && t.endsAt <= at).map((t) => t.id));
      if (!done.size) return;
      playChime();
      setTimers((list) => list.map((t) => (done.has(t.id) && !t.finishedAt ? { ...t, finishedAt: at, endsAt: null, remainingMs: 0 } : t)));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const start = useCallback((source: string, label: string, minutes: number) => {
    unlockAudio(); // a tap: the one moment browsers let a page prepare sound
    const durationMs = minutes * 60_000;
    const at = Date.now();
    setNow(at);
    setTimers((list) =>
      list.some((t) => t.source === source && !t.finishedAt)
        ? list
        : [...list, { id: `${source}:${at}`, source, label, durationMs, endsAt: at + durationMs, remainingMs: null, finishedAt: null }],
    );
    setAnnouncement(`${label} timer started, ${spokenDuration(durationMs)}.`);
  }, []);

  const pause = useCallback((id: string) => {
    const at = Date.now();
    setTimers((list) => list.map((t) => (t.id === id && t.endsAt !== null ? { ...t, remainingMs: Math.max(0, t.endsAt - at), endsAt: null } : t)));
    setAnnouncement("Timer paused.");
  }, []);

  const resume = useCallback((id: string) => {
    const at = Date.now();
    setNow(at);
    setTimers((list) => list.map((t) => (t.id === id && t.endsAt === null && !t.finishedAt ? { ...t, endsAt: at + (t.remainingMs ?? t.durationMs), remainingMs: null } : t)));
    setAnnouncement("Timer resumed.");
  }, []);

  /** Clear a timer, or dismiss a finished one. */
  const clear = useCallback((id: string) => setTimers((list) => list.filter((t) => t.id !== id)), []);

  const clearAll = useCallback(() => {
    setTimers([]);
    write(recipeId, []);
  }, [recipeId]);

  return { timers, now, start, pause, resume, clear, clearAll, announcement };
}
