import type { Metadata } from "next";

// /privacy (Privacy), SKELETON: what the app stores (owner email, recipes, source
// links, notification subscription) and what share links expose. Draft copy for
// Nathan to confirm. One reading column, 8 of 12 cols on desktop (SKIN).

export const metadata: Metadata = { title: "Privacy" };

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "What Backery stores",
    body: (
      <ul className="list-disc space-y-xs pl-lg">
        <li>The owner’s email address and password, to sign in. The password is stored only as a secure hash.</li>
        <li>Recipes: ingredients, steps, ratings, favorites, and the bake log with its notes.</li>
        <li>For imported recipes, the link to the original reel and the creator’s handle, so the creator is always credited.</li>
        <li>If timer alerts are turned on, a notification subscription for that device, so alerts reach a locked phone.</li>
        <li>A sign-in cookie, so you stay signed in. No advertising or tracking cookies.</li>
      </ul>
    ),
  },
  {
    heading: "What a share link shows",
    body: (
      <>
        <p>
          Anyone with a recipe’s share link can read that one recipe and change its scale: its title, ingredients, steps, rating, and the
          creator credit. They never see the bake log, notes, favorites, or any other recipe, and they can’t change anything.
        </p>
        <p className="mt-sm">Revoking the link in the Share dialog stops it working at once. Sharing again makes a new link.</p>
      </>
    ),
  },
  {
    heading: "Reels",
    body: (
      <p>
        When you import a reel, its caption and audio are sent to a transcription and extraction service to read the recipe. The video itself
        isn’t kept; the recipe links back to the original on Instagram.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
      <h1 className="type-display-md text-ink desktop:type-display-lg">Privacy</h1>
      <p className="mt-xs type-caption text-muted">Updated 30 September 2026</p>
      <p className="mt-base type-body-lg text-body">Backery is a personal baking app with one owner. Here is what it keeps and who can see it.</p>
      {sections.map((s) => (
        <section key={s.heading} aria-labelledby={slug(s.heading)} className="mt-xl">
          <h2 id={slug(s.heading)} className="type-heading text-ink">
            {s.heading}
          </h2>
          <div className="mt-sm type-body-md text-body">{s.body}</div>
        </section>
      ))}
    </div>
  );
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z]+/g, "-");
}
