import { SystemShell } from "@/components/shell/SystemShell";

// System pages (public): the App shell when the owner is signed in, the public shell
// for friends and guests.
export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return <SystemShell>{children}</SystemShell>;
}
