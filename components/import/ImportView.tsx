"use client";

import { Check, ChevronDown, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmActions } from "@/components/ui/ConfirmDialog";
import { InlineConfirmation } from "@/components/ui/InlineConfirmation";
import { Notice } from "@/components/ui/Notice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExternalLink, TextLink } from "@/components/ui/TextLink";
import { cx } from "@/components/ui/cx";
import { createImportKey, startImport } from "@/lib/data/actions";
import { FAIL_MESSAGES, IMPORT_MS, IMPORT_STAGES, SETUP_MESSAGES, SHORTCUT_URL, STAGE_MS, type FailReason, type SetupReason } from "@/lib/data/import";
import { formatKeyDate } from "@/lib/format";

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

export function ImportView({
  initialUrl,
  importedBefore,
  setupReason,
  importKeyCreatedAt,
}: {
  initialUrl: string;
  importedBefore: boolean;
  setupReason: SetupReason | null;
  importKeyCreatedAt: string | null;
}) {
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

      <SetUpTheShortcut defaultOpen={!importedBefore} setupReason={setupReason} initialCreatedAt={importKeyCreatedAt} />

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
          suppressHydrationWarning
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
 * BONES-import "Set up the Shortcut": 4 steps, open until the first import succeeds,
 * then collapsed to a plain disclosure, which expands in place into the full section
 * (focus moves to its heading). Opening the page at #set-up-the-shortcut (the
 * Library's empty state) opens it; so does a "Setup needed" reason — which also takes
 * focus immediately, not only when the owner expands it themselves.
 */
function SetUpTheShortcut({
  defaultOpen,
  setupReason,
  initialCreatedAt,
}: {
  defaultOpen: boolean;
  setupReason: SetupReason | null;
  initialCreatedAt: string | null;
}) {
  const linkedTo = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      return () => window.removeEventListener("hashchange", onChange);
    },
    () => window.location.hash === "#set-up-the-shortcut",
    () => false,
  );
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? (defaultOpen || linkedTo || Boolean(setupReason));
  const panelId = useId();

  const heading = useRef<HTMLHeadingElement>(null);
  // A "Setup needed" reason takes focus as soon as the page opens, same as the owner
  // expanding it by hand — both are "this just became the thing to do".
  const expandedByUser = useRef(Boolean(setupReason));
  useEffect(() => {
    if (open && expandedByUser.current) heading.current?.focus();
  }, [open]);

  if (!open) {
    // Collapsed: a plain disclosure, not a section heading.
    return (
      <div id="set-up-the-shortcut" className="mt-lg scroll-mt-lg">
        <button
          type="button"
          aria-expanded={false}
          onClick={() => {
            expandedByUser.current = true;
            setToggled(true);
          }}
          className="inline-flex min-h-touch-min items-center gap-xs rounded-sm type-body-md text-primary underline-offset-3 hover:underline focus-visible:outline-offset-2"
        >
          Set up the Shortcut
          <ChevronDown aria-hidden="true" className="size-icon-sm" strokeWidth={2.2} />
        </button>
      </div>
    );
  }

  return (
    <section id="set-up-the-shortcut" aria-labelledby="setup-heading" className="mt-xl scroll-mt-lg">
      <SectionHeading ref={heading} tabIndex={-1} id="setup-heading" className="outline-none">
        Set up the Shortcut
      </SectionHeading>
      {setupReason && (
        <Notice tone="warning" className="mt-sm">
          {SETUP_MESSAGES[setupReason]}
        </Notice>
      )}
      <ol role="list" id={panelId} className="mt-sm flex flex-col">
        <Step n={1}>
          <ExternalLink href={SHORTCUT_URL} className="inline-flex min-h-touch-min items-start">
            Get the Shortcut
          </ExternalLink>
        </Step>
        <Step n={2}>
          <p>Turn on Apple Intelligence (Settings → Apple Intelligence & Siri).</p>
          <p className="mt-xs type-body-sm text-muted">It reads the recipe on your device, free.</p>
        </Step>
        <Step n={3}>
          <ImportKeyStep initialCreatedAt={initialCreatedAt} />
        </Step>
        <Step n={4}>In Instagram, tap Share on a reel, then Nate’s Bakery.</Step>
      </ol>
    </section>
  );
}

/**
 * BONES: "Add your import key". Create import key shows it once, with Copy; it's
 * never shown again after that or after the page is left. With a key already made,
 * "Import key created 13 Oct" and Revoke and create a new one, which follows the
 * Destructive confirmations rule inline (no key works until the new one is pasted in).
 */
function ImportKeyStep({ initialCreatedAt }: { initialCreatedAt: string | null }) {
  const [createdAt, setCreatedAt] = useState(initialCreatedAt);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [creating, setCreating] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const copyButton = useRef<HTMLButtonElement>(null);
  const doneButton = useRef<HTMLButtonElement>(null);
  const revokeButton = useRef<HTMLButtonElement>(null);
  const keepButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"create" | "copy" | "done" | "revoke" | "keep" | null>(null);

  useEffect(() => {
    const target = { create: createButton, copy: copyButton, done: doneButton, revoke: revokeButton, keep: keepButton }[pendingFocus.current ?? "create"];
    if (pendingFocus.current) target.current?.focus();
    pendingFocus.current = null;
  }, [revealedKey, confirmRevoke]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 10_000);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function create() {
    setCreating(true);
    const key = await createImportKey();
    setCreating(false);
    setCreatedAt(new Date().toISOString());
    setRevealedKey(key);
    setConfirmRevoke(false);
    setCopied(false);
    pendingFocus.current = "copy";
  }

  async function copy() {
    if (!revealedKey) return;
    try {
      await navigator.clipboard.writeText(revealedKey);
    } catch {
      field.current?.select();
      document.execCommand("copy");
    }
    // Stays visible until Done or leaving the page, so a failed paste doesn't force a new key.
    setCopied(true);
  }

  function done() {
    setRevealedKey(null);
    setCopied(false);
    pendingFocus.current = "revoke";
  }

  return (
    <div className="mt-xs flex flex-col items-start gap-sm">
      <p>Add your import key.</p>
      {revealedKey ? (
        <>
          <div className="flex w-full max-w-[36ch] gap-sm">
            <input
              suppressHydrationWarning
              ref={field}
              aria-label="Import key"
              readOnly
              value={revealedKey}
              onFocus={(e) => e.currentTarget.select()}
              className="min-h-control-height min-w-0 flex-1 truncate rounded-md border border-border bg-surface-card px-base type-body-sm text-ink hover:border-ink focus-visible:border-primary focus-visible:outline-offset-1"
            />
            <Button ref={copyButton} variant="secondary" onClick={copy} data-autofocus>
              <Copy aria-hidden="true" />
              Copy
            </Button>
          </div>
          {copied && <InlineConfirmation>Key copied</InlineConfirmation>}
          <p className="type-body-sm text-muted">This is the only time you’ll see it — paste it into the Shortcut now.</p>
          <Button ref={doneButton} variant="secondary" onClick={done}>
            Done
          </Button>
        </>
      ) : (
        <>
          {createdAt && !confirmRevoke && <p className="type-body-sm text-muted">Import key created {formatKeyDate(createdAt)}</p>}
          {!confirmRevoke &&
            (createdAt ? (
              <Button
                ref={revokeButton}
                variant="text"
                onClick={() => {
                  pendingFocus.current = "keep";
                  setConfirmRevoke(true);
                }}
                className="-ml-sm"
              >
                Revoke and create a new one
              </Button>
            ) : (
              <Button ref={createButton} variant="secondary" onClick={create} aria-busy={creating || undefined}>
                {creating ? "Creating…" : "Create import key"}
              </Button>
            ))}
          {confirmRevoke && (
            <div role="group" aria-labelledby="revoke-key-question" className="w-full rounded-md border-l-4 border-error bg-error-wash px-base py-md">
              <p id="revoke-key-question" className="type-body-sm text-ink">
                The Shortcut stops working until you paste the new key.
              </p>
              <ConfirmActions
                className="mt-md"
                confirm="Revoke and create"
                cancel="Keep current key"
                autoFocusCancel={false}
                cancelRef={keepButton}
                onConfirm={create}
                onCancel={() => {
                  pendingFocus.current = "revoke";
                  setConfirmRevoke(false);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex min-h-touch-min items-start gap-md border-b border-hairline py-sm type-body-md text-ink last:border-b-0">
      <span className="min-w-[2ch] type-amount font-bold text-primary">{n}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
