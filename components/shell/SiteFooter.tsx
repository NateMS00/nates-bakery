import Link from "next/link";

/** BONES-shell footer: one group, Privacy. SKIN app-footer. */
export function SiteFooter() {
  return (
    <footer className="mx-auto mt-2xl w-full bg-canvas max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] px-(--gutter)">
      <div className="border-t border-hairline py-lg">
        <Link
          href="/privacy"
          className="inline-flex min-h-touch-min min-w-touch-min items-center rounded-sm type-caption text-muted underline decoration-1 underline-offset-3 hover:decoration-2 focus-visible:outline-offset-2"
        >
          Privacy
        </Link>
      </div>
    </footer>
  );
}
