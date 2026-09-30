import { AppShell } from "@/components/shell/AppShell";

// App area (owner). Access is enforced at the route boundary in proxy.ts (STUB session).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
