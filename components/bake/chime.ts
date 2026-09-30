"use client";

// The finished-timer sound. SKIN Known Gap: the real chime is still to be chosen or
// produced; until then, a short, warm two-note chime synthesized with Web Audio
// (soft sine tones, no alarm buzz), played three times so it's heard across a kitchen.

let context: AudioContext | null = null;

/** Call from a tap (starting a timer): browsers only allow sound after a user gesture. */
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
  } catch {
    /* No Web Audio: the banner still shows. */
  }
}

export function playChime() {
  if (!context) return;
  const start = context.currentTime + 0.05;
  for (let repeat = 0; repeat < 3; repeat++) {
    [659.25, 987.77].forEach((frequency, i) => {
      const at = start + repeat * 1.1 + i * 0.22;
      const osc = context!.createOscillator();
      const gain = context!.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.25, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.9);
      osc.connect(gain).connect(context!.destination);
      osc.start(at);
      osc.stop(at + 1);
    });
  }
}
