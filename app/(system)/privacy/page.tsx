import type { Metadata } from "next";

// /privacy (Privacy), BONES-system.md 1.3.0: what the app stores (owner email,
// recipes, favorites, the bake log with each bake's rating and photos, reel
// captions and thumbnails, the import key, notification subscription), what share
// links expose, how Apify and Apple Intelligence read a reel, and where data is
// stored. One reading column, 8 of 12 cols on desktop (SKIN).

export const metadata: Metadata = { title: "Privacy" };

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "What Nate’s Bakery stores",
    body: (
      <ul className="list-disc space-y-xs pl-lg">
        <li>The owner’s email address and password, to sign in. The password is stored only as a secure hash.</li>
        <li>Recipes: ingredients, steps, and favorites; the bake log, including each bake’s rating and the photos you add to it.</li>
        <li>For imported recipes: the reel’s link, the creator’s handle (so the creator is always credited), its caption, and a copy of its thumbnail.</li>
        <li>The import key that connects the Shortcut to your account, stored only in a form that can’t be read back — not even by Nate’s Bakery.</li>
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
        When you import a reel, Nate’s Bakery sends the link to Apify, a web-scraping service, which returns the reel’s caption, creator
        handle, and thumbnail. The recipe itself is read from the caption by Apple Intelligence, through the Shortcut — on your device, or on
        Apple’s Private Cloud Compute — never by Nate’s Bakery’s own servers. The reel’s audio and video are never downloaded.
      </p>
    ),
  },
  {
    heading: "Where it is stored",
    body: <p>The database is Supabase, in the United States (Oregon). The app itself runs on Vercel.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
      <h1 className="type-display-md text-ink desktop:type-display-lg">Privacy</h1>
      <p className="mt-xs type-caption text-muted">Updated 15 October 2026</p>
      <p className="mt-base type-body-lg text-body">Nate’s Bakery is a personal baking app with one owner. Here is what it keeps and who can see it.</p>
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
