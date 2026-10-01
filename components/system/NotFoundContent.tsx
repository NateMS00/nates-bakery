import { ButtonLink } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";

// SKELETON not-found: unknown routes, recipes, and drafts; links to /recipes when
// signed in, otherwise /login. Build decisions: page-top aligned in the reading column
// like other pages (not centered like /r/expired, which has no way forward), one
// sentence, and the way out as a secondary button.
export async function NotFoundContent() {
  const session = await getSession();
  return (
    <div className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
      <h1 className="type-display-md text-ink desktop:type-display-lg">Page not found</h1>
      <p className="mt-sm type-body-lg text-body">This page doesn’t exist, or the recipe was deleted.</p>
      <ButtonLink href={session ? "/recipes" : "/login"} variant="secondary" className="mt-lg">
        {session ? "Go to your recipes" : "Sign in"}
      </ButtonLink>
    </div>
  );
}
