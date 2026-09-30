import { Button } from "@/components/ui/Button";
import { stubSignIn } from "@/lib/auth/actions";

// STUB sign-in, only so Sign out and the signed-out redirect can be exercised.
// The real Sign In page comes with PROMPTS.md step 8 and the backend.

export const metadata = { title: "Sign in" };

export default async function LoginStub({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next ?? "/recipes";
  return (
    <main id="main" className="mx-auto max-w-[calc(var(--col)*6+var(--gutter)*5)] px-(--gutter) py-2xl">
      <p className="type-wordmark text-primary">Backery</p>
      <h1 className="mt-lg type-display-md text-ink">Sign in</h1>
      <p className="mt-sm type-body-md text-body">
        Sign-in isn&rsquo;t built yet. This stub signs you back in as the owner.
      </p>
      <form action={stubSignIn.bind(null, next)} className="mt-lg">
        <Button type="submit" variant="primary">
          Continue as owner
        </Button>
      </form>
    </main>
  );
}
