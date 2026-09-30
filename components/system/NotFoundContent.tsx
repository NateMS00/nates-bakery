import { ButtonLink } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";

// SKELETON not-found: links to /recipes when signed in, otherwise /login.
// Placeholder layout until the system pages are built (PROMPTS.md step 8).
export async function NotFoundContent() {
  const session = await getSession();
  return (
    <div className="pb-2xl">
      <h1 className="type-display-md text-ink desktop:type-display-lg">Page not found</h1>
      <p className="mt-sm max-w-prose type-body-md text-body">This page doesn&rsquo;t exist, or the recipe was deleted.</p>
      <ButtonLink href={session ? "/recipes" : "/login"} variant="secondary" className="mt-lg">
        {session ? "Go to your recipes" : "Sign in"}
      </ButtonLink>
    </div>
  );
}
