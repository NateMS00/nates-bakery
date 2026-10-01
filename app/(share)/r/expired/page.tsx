import type { Metadata } from "next";

// /r/expired (Link Unavailable), BONES-r-expired.md: a heading and one sentence,
// centered in the space between header and footer; 6 of 12 cols on desktop. It never
// says whether the link was revoked or the recipe deleted, and has no links into the app.

export const metadata: Metadata = { title: "Link unavailable" };

export default function LinkUnavailablePage() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center py-2xl text-center desktop:w-[calc(var(--col)*6+var(--gutter)*5)]">
      <h1 className="type-display-md text-ink desktop:type-display-lg">This link no longer works</h1>
      <p className="mt-sm type-body-lg text-body">Ask the person who shared it to send you a new one.</p>
    </div>
  );
}
