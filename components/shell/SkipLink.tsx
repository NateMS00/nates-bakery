/** BONES-shell: skip link to main content, visible when focused. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-md bg-surface-card type-button text-primary focus:not-sr-only focus:fixed focus:top-sm focus:left-sm focus:z-50 focus:inline-flex focus:min-h-touch-min focus:items-center focus:px-base focus:shadow-float"
    >
      Skip to main content
    </a>
  );
}
