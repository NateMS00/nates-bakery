"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExternalLink, TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { startImport } from "@/lib/data/actions";
import { FAIL_MESSAGES, IMPORT_MS, IMPORT_STAGES, SHORTCUT_URL, STAGE_MS, type FailReason } from "@/lib/data/import";

// /import (Import), BONES-import.md: one centered column (8 of 12 cols on desktop).
// Reel Link with the status area under Import (Processing, Invalid link, Import failed,
// Already imported), Share from Instagram, and Manual Entry. ?url= prefills the field
// and starts the import on load. The primary action is in the flow, not a sticky bar.

type Status =
  | { kind: "idle" }
  | { kind: "processing"; draftId: string; stage: number }
  | { kind: "failed"; reason: FailReason; url: string }
  | { kind: "already"; recipeId: string; title: string };

const canPaste = () => typeof navigator !== "undefined" && typeof navigator.clipboard?.readText === "function";

export function ImportView({ initialUrl, importedBefore }: { initialUrl: string; importedBefore: boolean }) {
  const router = useRouter();
  const [link, setLink] = useState(initialUrl);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const started = useRef(false);
  const paste = useSyncExternalStore(() => () => {}, canPaste, () => false);
  const locked = busy || status.kind === "processing" || status.kind === "failed";

  async function run(url: string, again = false) {
    if (!url.trim()) {
      setError("Paste a link to an Instagram reel.");
      field.current?.focus();
      return;
    }
    setBusy(true);
    setError(undefined);
    const result = await startImport(url, { again });
    setBusy(false);
    if (result.status === "invalid") {
      setError("That isn’t an Instagram reel or post link. Check it and try again.");
      field.current?.focus();
    } else if (result.status === "already") {
      setStatus({ kind: "already", recipeId: result.recipeId, title: result.title });
    } else if (result.status === "failed") {
      setStatus({ kind: "failed", reason: result.reason, url });
    } else {
      setStatus({ kind: "processing", draftId: result.draftId, stage: 0 });
    }
  }

  // ?url= starts the import on load (once, even under React's double effects in dev).
  useEffect(() => {
    if (initialUrl && !started.current) {
      started.current = true;
      void run(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once for the URL the page opened with
  }, []);

  // Processing: walk through the stages, then open Review Import on its own.
  const draftId = status.kind === "processing" ? status.draftId : null;
  useEffect(() => {
    if (!draftId) return;
    const timers = IMPORT_STAGES.map((_, i) => window.setTimeout(() => setStatus({ kind: "processing", draftId, stage: i + 1 }), STAGE_MS * (i + 1)));
    timers.push(window.setTimeout(() => router.push(`/import/${draftId}`), IMPORT_MS + 150));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [draftId, router]);

  return (
    <div className="mx-auto desktop:max-w-[calc(var(--col)*8+var(--gutter)*7)]">
      <h1 className="type-display-md text-ink desktop:type-display-lg">Import from a reel</h1>

      {/* Reel Link */}
      <form
        noValidate
        className="mt-lg grid gap-sm tablet:grid-cols-[minmax(0,1fr)_calc(var(--col)*2+var(--gutter))] tablet:items-start desktop:grid-cols-[minmax(0,1fr)_calc(var(--col)*2+var(--gutter))]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!locked) void run(link);
        }}
      >
        <ReelField
          ref={field}
          value={link}
          error={error}
          locked={locked}
          canPaste={paste}
          onChange={(v) => {
            setLink(v);
            setError(undefined);
            if (status.kind === "already") setStatus({ kind: "idle" });
          }}
        />
        {/* From tablet up, Import sits beside the field: offset by the label's height (SKIN label: 13px × 1.2) */}
        <Button type="submit" variant="primary" disabled={locked} aria-busy={busy || undefined} className="w-full tablet:mt-[calc(13px*1.2+var(--spacing-xs))]">
          Import
        </Button>
      </form>

      <StatusArea
        status={status}
        onAgain={() => void run(link, true)}
        onTryAnother={() => {
          setStatus({ kind: "idle" });
          setLink("");
          requestAnimationFrame(() => field.current?.focus());
        }}
      />

      <ShareFromInstagram defaultOpen={!importedBefore} />

      {/* Manual Entry */}
      <p className="mt-lg type-body-md text-body">
        No reel?{" "}
        <TextLink href="/recipes/new" className="inline-flex min-h-touch-min items-center">
          Enter a recipe by hand
        </TextLink>
      </p>
    </div>
  );
}

function ReelField({
  ref,
  value,
  error,
  locked,
  canPaste,
  onChange,
}: {
  ref: React.RefObject<HTMLInputElement | null>;
  value: string;
  error?: string;
  locked: boolean;
  canPaste: boolean;
  onChange: (value: string) => void;
}) {
  const id = "reel-link";
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <label htmlFor={id} className="type-label text-muted">
        Reel link
      </label>
      <div
        className={cx(
          "flex min-h-control-height items-center rounded-md border border-border bg-surface-card text-ink transition-colors duration-(--motion-fast) ease-skin hover:border-ink focus-within:border-primary focus-within:outline-3 focus-within:outline-offset-1 focus-within:outline-focus-ring",
          error && "border-2 border-error! hover:border-error",
          locked && "border-hairline bg-surface-disabled text-disabled hover:border-hairline",
        )}
      >
        <input
          ref={ref}
          id={id}
          type="url"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="instagram.com/reel/…"
          value={value}
          readOnly={locked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 self-stretch bg-transparent px-base type-body-md outline-none placeholder:text-muted"
        />
        {canPaste && !locked && (
          <Button
            variant="text"
            className="mr-xs"
            onClick={async () => {
              try {
                onChange((await navigator.clipboard.readText()).trim());
              } catch {
                /* Permission refused: the field still accepts a long-press paste. */
              }
              ref.current?.focus();
            }}
          >
            Paste
          </Button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="type-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** BONES: all states render here, directly under Import, so the first viewport shows them. */
function StatusArea({ status, onAgain, onTryAnother }: { status: Status; onAgain: () => void; onTryAnother: () => void }) {
  if (status.kind === "idle") return <div className="mt-base" />;

  if (status.kind === "processing") {
    const current = IMPORT_STAGES[Math.min(status.stage, IMPORT_STAGES.length - 1)];
    return (
      <div className="mt-lg">
        <ol role="list" className="flex flex-col gap-sm" aria-label="Import progress">
          {IMPORT_STAGES.map((name, i) => (
            <ProgressStage key={name} name={name} state={i < status.stage ? "done" : i === status.stage ? "current" : "pending"} />
          ))}
        </ol>
        <p role="status" className="sr-only">
          {status.stage >= IMPORT_STAGES.length ? "Import finished. Opening the review." : `${current}…`}
        </p>
        <p className="mt-base type-body-sm text-body">
          You can leave: it will wait in your Library under Drafts.{" "}
          <TextLink href="/recipes" className="inline-flex min-h-touch-min items-center">
            Go to Library
          </TextLink>
        </p>
      </div>
    );
  }

  if (status.kind === "failed") {
    return (
      <div role="alert" aria-labelledby="import-failed" className="mt-lg rounded-md border-l-4 border-error bg-error-wash px-base py-md">
        <p id="import-failed" className="type-body-md text-ink">
          {FAIL_MESSAGES[status.reason]}
        </p>
        <div className="mt-md flex flex-col gap-sm tablet:flex-row">
          <ButtonLink href={`/recipes/new?source=${encodeURIComponent(status.url)}`} variant="primary" className="w-full tablet:w-auto">
            Enter it manually
          </ButtonLink>
          <Button variant="secondary" onClick={onTryAnother} className="w-full tablet:w-auto">
            Try another link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div role="status" className="mt-lg rounded-md border-l-4 border-primary bg-info-wash px-base py-md">
      <p className="type-body-md text-ink">
        You already saved this reel as{" "}
        <Link href={`/recipes/${status.recipeId}`} className="rounded-sm font-bold text-primary underline decoration-1 underline-offset-3 hover:decoration-2 focus-visible:outline-offset-2">
          {status.title}
        </Link>
        .
      </p>
      <Button variant="secondary" onClick={onAgain} className="mt-md w-full tablet:w-auto">
        Import again
      </Button>
    </div>
  );
}

/** SKIN progress-stage: empty circle pending, spinning ring current, olive check done. */
function ProgressStage({ name, state }: { name: string; state: "pending" | "current" | "done" }) {
  return (
    <li className={cx("flex items-center gap-sm type-body-md", state === "pending" ? "text-muted" : state === "current" ? "text-ink" : "text-success")}>
      <span aria-hidden="true" className="grid size-icon-sm shrink-0 place-items-center">
        {state === "done" ? (
          <Check className="size-icon-sm" strokeWidth={3} />
        ) : state === "current" ? (
          <span className="size-icon-sm animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none" />
        ) : (
          <span className="size-icon-sm rounded-full border-2 border-border" />
        )}
      </span>
      {name}
      <span className="sr-only">{state === "done" ? ", done" : state === "current" ? ", in progress" : ""}</span>
      {state === "current" && (
        <span aria-hidden="true" className="hidden type-caption text-muted motion-reduce:inline">
          In progress
        </span>
      )}
    </li>
  );
}

/**
 * BONES Share from Instagram: 3 steps, open until the first import succeeds, then
 * collapsed to a plain "How to share from Instagram" disclosure, which expands in
 * place into the full section (focus moves to its heading). Opening the page
 * at #share-from-instagram (the Library's empty state) opens it.
 */
function ShareFromInstagram({ defaultOpen }: { defaultOpen: boolean }) {
  const linkedTo = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      return () => window.removeEventListener("hashchange", onChange);
    },
    () => window.location.hash === "#share-from-instagram",
    () => false,
  );
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? (defaultOpen || linkedTo);
  const panelId = useId();

  const heading = useRef<HTMLHeadingElement>(null);
  const expandedByUser = useRef(false);
  useEffect(() => {
    if (open && expandedByUser.current) heading.current?.focus();
  }, [open]);

  if (!open) {
    // Collapsed: a plain disclosure, not a section heading.
    return (
      <div id="share-from-instagram" className="mt-lg scroll-mt-lg">
        <button
          type="button"
          aria-expanded={false}
          onClick={() => {
            expandedByUser.current = true;
            setToggled(true);
          }}
          className="inline-flex min-h-touch-min items-center gap-xs rounded-sm type-body-md text-primary underline-offset-3 hover:underline focus-visible:outline-offset-2"
        >
          How to share from Instagram
          <ChevronDown aria-hidden="true" className="size-icon-sm" strokeWidth={2.2} />
        </button>
      </div>
    );
  }

  return (
    <section id="share-from-instagram" aria-labelledby="share-heading" className="mt-xl scroll-mt-lg">
      <SectionHeading ref={heading} tabIndex={-1} id="share-heading" className="outline-none">
        Share from Instagram
      </SectionHeading>
      <ol role="list" id={panelId} className="mt-sm flex flex-col">
        <Step n={1}>
          <ExternalLink href={SHORTCUT_URL} className="inline-flex min-h-touch-min items-center">
            Get the Shortcut
          </ExternalLink>
        </Step>
        <Step n={2}>In Instagram, tap Share on a reel, then Backery.</Step>
        <Step n={3}>The reel opens here and imports on its own.</Step>
      </ol>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex min-h-touch-min items-center gap-md border-b border-hairline py-xs type-body-md text-ink last:border-b-0">
      <span className="min-w-[2ch] type-amount font-bold text-primary">{n}</span>
      <span>{children}</span>
    </li>
  );
}
