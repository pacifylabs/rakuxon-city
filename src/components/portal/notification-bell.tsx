"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import {
  markAllNotificationsRead,
  markNotificationReadById,
} from "@/lib/portal/actions/notifications";

export type PortalNotificationItem = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export function PortalNotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: PortalNotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-foreground transition-colors hover:bg-surface-muted"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium text-ivory-light">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-card border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-body font-medium text-foreground">Notifications</p>
            {unreadCount > 0 ? (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="cursor-pointer text-caption text-accent-text underline underline-offset-4"
                >
                  Mark all read
                </button>
              </form>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-caption text-muted">Nothing yet.</li>
            ) : (
              notifications.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "border-b border-line last:border-b-0",
                    !item.readAt && "bg-surface-muted/60",
                  )}
                >
                  <NotificationRow item={item} onNavigate={() => setOpen(false)} />
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({
  item,
  onNavigate,
}: {
  item: PortalNotificationItem;
  onNavigate: () => void;
}) {
  const [, startTransition] = useTransition();

  function markRead() {
    if (item.readAt) return;
    startTransition(() => {
      void markNotificationReadById(item.id);
    });
  }

  const content = (
    <>
      <p className="text-body text-foreground">{item.title}</p>
      {item.body ? (
        <p className="mt-1 line-clamp-2 text-caption text-muted">{item.body}</p>
      ) : null}
      <p className="mt-2 text-[11px] text-muted">
        {new Date(item.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={() => {
          markRead();
          onNavigate();
        }}
        className="block px-4 py-3 hover:bg-surface-muted"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        markRead();
        onNavigate();
      }}
      className="w-full cursor-pointer px-4 py-3 text-left hover:bg-surface-muted"
    >
      {content}
    </button>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 01-3.46 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
