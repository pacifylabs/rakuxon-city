"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/cn";

/**
 * Confirm-then-act, wrapped around a Server Action.
 *
 * Built on the native `<dialog>` element rather than a hand-rolled overlay,
 * which buys the three things a modal has to get right for free: focus is
 * trapped inside it, Escape closes it, and the rest of the page becomes inert
 * to a screen reader. Doing that manually is where most custom modals quietly
 * fail accessibility.
 *
 * The action runs inside `useTransition`, so the confirm button can say
 * "Deleting…" and the modal stays open until the server actually finishes —
 * closing optimistically would report success for a write that might fail.
 *
 * Success is a toast rather than a second modal: the work is done, and making
 * someone dismiss a dialog to acknowledge that is a click that buys nothing.
 * A destructive confirmation is worth interrupting for; a completed save is not.
 */
export function ConfirmAction({
  action,
  title,
  body,
  confirmLabel,
  successMessage,
  tone = "default",
  children,
  className,
}: {
  /** The Server Action to run once confirmed. */
  action: () => Promise<void>;
  title: string;
  body: string;
  confirmLabel: string;
  successMessage: string;
  tone?: "default" | "danger";
  /** The trigger's contents — usually a label, sometimes a label plus icon. */
  children: React.ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const { notify } = useToast();

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    if (!pending) dialogRef.current?.close();
  }

  function confirm() {
    startTransition(async () => {
      await action();
      dialogRef.current?.close();
      notify(successMessage);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(
          "min-h-9 cursor-pointer rounded-control px-2.5 text-caption transition-colors",
          tone === "danger"
            ? "text-error hover:bg-error/10"
            : "text-accent-text hover:bg-surface-muted",
          className,
        )}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          // Clicking the backdrop closes. The dialog element itself fills the
          // viewport, so a click landing on it rather than on the card is a
          // backdrop click.
          if (event.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-0 text-foreground backdrop:bg-charcoal-deep/60"
      >
        <div className="p-6">
          <h2 className="text-heading text-foreground">{title}</h2>
          <p className="mt-2 text-body text-muted">{body}</p>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="min-h-10 cursor-pointer rounded-full border border-line px-4 text-body text-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={pending}
              className={cn(
                "min-h-10 cursor-pointer rounded-full px-5 text-body transition-colors disabled:cursor-wait disabled:opacity-70",
                tone === "danger"
                  ? "bg-error text-ivory-light hover:opacity-90"
                  : "bg-primary text-ivory-light hover:bg-primary-hover",
              )}
            >
              {pending ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/* --------------------------------------------------------------------- */
/* Toast                                                                  */
/* --------------------------------------------------------------------- */

type ToastMessage = { id: number; text: string };

let pushToast: ((text: string) => void) | null = null;

/**
 * A deliberately tiny toast channel — a module-level setter rather than a
 * context provider.
 *
 * Context would mean wrapping the whole admin in a client provider and
 * turning every server-rendered page underneath it into a client boundary
 * concern. One mount point in the shell, one module-level function, and any
 * component can notify without the tree knowing about it.
 */
function useToast() {
  return {
    notify: (text: string) => pushToast?.(text),
  };
}

/** Mounted once, in the admin shell. */
export function ToastHost() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    pushToast = (text: string) => {
      const id = Date.now() + Math.random();
      setMessages((current) => [...current, { id, text }]);
      window.setTimeout(() => {
        setMessages((current) => current.filter((m) => m.id !== id));
      }, 4000);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div
      // `role="status"` and `aria-live="polite"` so a screen reader announces
      // the result without stealing focus from wherever the user is.
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-line-dark bg-charcoal px-5 py-3 text-body text-ivory-light shadow-lift"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-accent-light"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {message.text}
        </div>
      ))}
    </div>
  );
}

/**
 * The same confirm-then-act treatment for a form that carries fields — the
 * status selector on a listing row, where the value is part of the payload.
 *
 * Takes the whole `FormData`, so the selected status travels with it.
 */
export function ConfirmSubmit({
  action,
  title,
  body,
  valueField,
  confirmLabel,
  successMessage,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  title: string;
  /** Static text. Cannot be a function — see the note below. */
  body: string;
  /**
   * Optional name of a `<select>` inside this form. Its currently selected
   * option's TEXT is appended to `body`, so the dialog can say "…becomes
   * Reserved" without the parent passing a callback.
   *
   * This exists because a function prop cannot cross the server→client
   * boundary: React refuses anything that isn't a Server Action, and the
   * pages rendering these dialogs are server components. Reading the value
   * from the DOM at open time keeps the message specific and the prop
   * serialisable.
   */
  valueField?: string;
  confirmLabel: string;
  successMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState("");
  const [pending, startTransition] = useTransition();
  const { notify } = useToast();

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(event) => {
        event.preventDefault();

        if (valueField) {
          const select = event.currentTarget.elements.namedItem(valueField);
          if (select instanceof HTMLSelectElement) {
            setDetail(select.options[select.selectedIndex]?.text ?? "");
          }
        }

        dialogRef.current?.showModal();
      }}
    >
      {children}

      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current && !pending) {
            dialogRef.current?.close();
          }
        }}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-0 text-foreground backdrop:bg-charcoal-deep/60"
      >
        <div className="p-6">
          <h2 className="text-heading text-foreground">{title}</h2>
          <p className="mt-2 text-body text-muted">
            {detail ? `${body} It becomes ${detail}.` : body}
          </p>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => !pending && dialogRef.current?.close()}
              disabled={pending}
              className="min-h-10 cursor-pointer rounded-full border border-line px-4 text-body text-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const form = formRef.current;
                if (!form) return;
                const data = new FormData(form);
                startTransition(async () => {
                  await action(data);
                  dialogRef.current?.close();
                  notify(successMessage);
                });
              }}
              className="min-h-10 cursor-pointer rounded-full bg-primary px-5 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </form>
  );
}
