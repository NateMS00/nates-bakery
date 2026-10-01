import { SystemShell } from "@/components/shell/SystemShell";
import { NotFoundContent } from "@/components/system/NotFoundContent";

// Unknown routes outside the app area: the App shell for the owner, the public shell
// otherwise, so a guest never sees owner navigation.
export default function NotFound() {
  return (
    <SystemShell>
      <NotFoundContent />
    </SystemShell>
  );
}
