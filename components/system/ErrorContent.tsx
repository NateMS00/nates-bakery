"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

// SKELETON error: recover from unexpected failures, with a retry and a link back.
// Try again re-requests the page from the server (a plain reset would only re-render
// what already failed). Focus moves to the heading so the change is announced.

export function ErrorContent({ reset, back }: { reset: () => void; back?: { href: string; label: string } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="mx-auto w-full desktop:w-[calc(var(--col)*8+var(--gutter)*7)]">
      <h1 ref={heading} tabIndex={-1} className="type-display-md text-ink outline-none desktop:type-display-lg">
        Something went wrong
      </h1>
      <p className="mt-sm type-body-lg text-body">This page didn’t load. Nothing you saved is lost; try again in a moment.</p>
      <div className="mt-lg flex flex-col gap-sm tablet:flex-row">
        <Button
          variant="primary"
          aria-busy={pending || undefined}
          onClick={() =>
            start(() => {
              router.refresh();
              reset();
            })
          }
          className="w-full tablet:w-auto"
        >
          Try again
        </Button>
        {back && (
          <ButtonLink href={back.href} variant="secondary" className="w-full tablet:w-auto">
            {back.label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
