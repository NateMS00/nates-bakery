import { LibrarySkeleton } from "@/components/library/LibrarySkeleton";
import { importEnabled } from "@/lib/features";

export default function Loading() {
  return <LibrarySkeleton importEnabled={importEnabled()} />;
}
