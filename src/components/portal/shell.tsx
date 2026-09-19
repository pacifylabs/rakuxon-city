"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { signOut } from "@/lib/admin/actions/profile";
import type { SessionUser } from "@/lib/auth/session";
import {
  PortalNotificationBell,
  type PortalNotificationItem,
} from "@/components/portal/notification-bell";

const NAV = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/listings", label: "My listings" },
];

export function PortalShell({
  user,
  logo,
  notifications,
  unreadCount,
  children,
}: {
  user: SessionUser;
  logo: { url: string; alt: string; width: number; height: number };
  notifications: PortalNotificationItem[];
  unreadCount: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function navActive(href: string) {
    return (
      pathname === href ||
      (href !== "/portal" && pathname.startsWith(href))
    );
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="shrink-0" aria-label="Rakuxon City">
            <Image
              src={logo.url}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="h-7 w-auto sm:h-8"
              sizes="180px"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-body transition-colors",
                  navActive(item.href)
                    ? "text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <PortalNotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
            />
            <form action={signOut} className="hidden sm:block">
              <button
                type="submit"
                className="cursor-pointer text-caption text-muted underline underline-offset-4 hover:text-foreground"
              >
                Sign out
              </button>
            </form>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-line md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="sr-only">Menu</span>
              <div className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 bg-foreground" />
                <span className="block h-0.5 w-4 bg-foreground" />
                <span className="block h-0.5 w-4 bg-foreground" />
              </div>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-line px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "min-h-11 flex items-center text-body",
                    navActive(item.href) ? "text-foreground" : "text-muted",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action={signOut} className="mt-4 border-t border-line pt-4">
              <button
                type="submit"
                className="cursor-pointer text-body text-muted underline underline-offset-4"
              >
                Sign out ({user.name})
              </button>
            </form>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
