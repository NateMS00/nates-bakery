import type { Metadata } from "next";
import { AccountSettings } from "@/components/account/AccountSettings";
import { Button } from "@/components/ui/Button";
import { importEnabled } from "@/lib/features";
import { getSession } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";

// /account (Account), BONES-system.md 1.3.0: reached from the tab bar's Account
// tab in the installed app; in Safari the account menu holds the same items, and
// this page still works if opened directly. One reading column, 8 of 12 cols on
// desktop (SKIN), same as Privacy.

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await getSession();
  return (
    <div className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
      <h1 className="type-display-md text-ink desktop:type-display-lg">Account</h1>
      <p className="mt-xs type-body-sm text-muted">Signed in as {session?.email}</p>
      <AccountSettings importEnabled={importEnabled()} className="mt-lg" />
      <form action={signOut} className="mt-base">
        <Button type="submit" variant="secondary" className="w-full tablet:w-auto">
          Sign out
        </Button>
      </form>
    </div>
  );
}
