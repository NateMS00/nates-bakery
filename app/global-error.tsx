"use client";

// Last resort when the root layout itself fails: no fonts or theme are guaranteed, so
// plain HTML with system colors. Rare enough to keep minimal.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
        <h1>Something went wrong</h1>
        <p>Backery didn’t load. Try again in a moment.</p>
        <button type="button" onClick={reset} style={{ minHeight: 48, padding: "0 24px", fontSize: 16 }}>
          Try again
        </button>
      </body>
    </html>
  );
}
