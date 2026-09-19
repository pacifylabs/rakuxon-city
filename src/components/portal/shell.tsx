"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { signOut } from "@/lib/admin/actions/profile";
import type { SessionUser } from "@/lib/auth/session";

const NAV = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/listings", label: "My listings" },
];

export function PortalShell({
  user,
  logo,
  children,
}: {
  user: SessionUser;
  logo: { url: string; alt: string; width: number; height: number };
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="Rakuxon City">
            <Image
              src={logo.url}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="h-8 w-auto"
              sizes="180px"
            />
          </Link>
          <nav className="flex items-center gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-body transition-colors",
                  pathname === item.href ||
                    (item.href !== "/portal" && pathname.startsWith(item.href))
                    ? "text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <button
              type="submit"
              className="cursor-pointer text-caption text-muted underline underline-offset-4 hover:text-foreground"
            >
              Sign out ({user.name})
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
