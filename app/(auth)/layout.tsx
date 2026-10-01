import { PublicShell } from "@/components/shell/PublicShell";

// Auth area (guest-only; a signed-in owner is sent to /recipes in proxy.ts). Build
// decision: the public shell (wordmark, no navigation), since a guest has nowhere
// else in the app to go.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
