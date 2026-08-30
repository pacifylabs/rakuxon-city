"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ToastHost } from "@/components/admin/confirm-action";
import { signOut } from "@/lib/admin/actions/profile";
import type { SessionUser } from "@/lib/auth/session";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  visible?: (user: SessionUser) => boolean;
};

/**
 * The admin shell — sticky sidebar, top bar, and the mobile drawer.
 *
 * A client component because three things here need the browser: the current
 * pathname for active state, the drawer's open/closed state, and the theme
 * toggle. The pages it wraps stay server components; only the chrome is
 * client-side.
 *
 * Navigation encodes the access matrix from docs/PHASE_7_ADMIN_DASHBOARD.md.
 * It is a convenience, not a boundary — every route re-checks in its own
 * query layer (`lib/admin/access.ts`), because a hidden link stops nobody
 * from typing a URL.
 */
const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <IconGrid /> },
  {
    href: "/admin/listings/land",
    label: "Land",
    icon: <IconMap />,
    visible: (u) =>
      u.role === "ADMIN" || (u.role === "SALES" && u.salesTrack !== "HOMES"),
  },
  {
    href: "/admin/listings/homes",
    label: "Homes",
    icon: <IconHome />,
    visible: (u) =>
      u.role === "ADMIN" || (u.role === "SALES" && u.salesTrack !== "LAND"),
  },
  {
    href: "/admin/estates",
    label: "Estates",
    icon: <IconLayers />,
    visible: (u) => u.role === "ADMIN" || u.role === "SALES",
  },
  {
    href: "/admin/enquiries",
    label: "Enquiries",
    icon: <IconInbox />,
    visible: (u) => u.role === "ADMIN" || u.role === "SALES",
  },
  {
    href: "/admin/investor-enquiries",
    label: "Investors",
    icon: <IconBriefcase />,
    visible: (u) => u.role === "ADMIN" || u.role === "INVESTOR_MANAGER",
  },
  {
    href: "/admin/media",
    label: "Media",
    icon: <IconImage />,
    visible: (u) => u.role === "ADMIN" || u.role === "SALES",
  },
  {
    href: "/admin/articles",
    label: "Guides",
    icon: <IconDoc />,
    visible: (u) => u.role === "ADMIN",
  },
  {
    href: "/admin/users",
    label: "Team",
    icon: <IconUsers />,
    visible: (u) => u.role === "ADMIN",
  },
  {
    href: "/admin/import",
    label: "Import",
    icon: <IconUpload />,
    visible: (u) => u.role === "ADMIN",
  },
  { href: "/admin/settings", label: "Settings", icon: <IconCog /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  user,
  logo,
  children,
}: {
  user: SessionUser;
  logo: { url: string; alt: string; width: number; height: number };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => item.visible?.(user) ?? true);
  const current = items.find((item) => isActive(pathname, item.href));

  return (
    <div className="min-h-svh bg-background">
      {/*
        Sticky, full-height, its own scroll container. `h-svh` rather than
        `h-screen`: on mobile browsers `vh` includes the collapsing chrome, so
        `h-screen` leaves the last nav item under the address bar.
      */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-[4.5rem] shrink-0 items-center border-b border-line px-5">
          <Link href="/admin" aria-label="Rakuxon City admin">
            <LogoMark logo={logo} priority />
          </Link>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={isActive(pathname, item.href)} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-line p-3">
          <UserCard user={user} />
        </div>
      </aside>

      {/* Mobile drawer. Rendered only when open, so it costs nothing closed. */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 cursor-default bg-charcoal-deep/60"
          />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-line bg-surface">
            <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-5">
              <LogoMark logo={logo} />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex size-9 cursor-pointer items-center justify-center rounded-control text-muted hover:bg-surface-muted hover:text-foreground"
              >
                <IconClose />
              </button>
            </div>
            <nav
              aria-label="Admin, mobile"
              className="flex-1 overflow-y-auto p-3"
            >
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      active={isActive(pathname, item.href)}
                      onNavigate={() => setDrawerOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            </nav>
            <div className="shrink-0 border-t border-line p-3">
              <UserCard user={user} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        {/*
          Sticky top bar. Carries the current section name, so the page never
          has to repeat it, plus the theme toggle — which had no entry point
          anywhere in the admin before this.
        */}
        {/*
          `h-[4.5rem]` matches the sidebar's logo header exactly. They sit
          side by side and each draws its own bottom border, so any difference
          in height shows up as two rules that fail to meet at the seam — it
          was 72px against 64px, and the 8px step was visible straight down
          the join.
        */}
        <header className="sticky top-0 z-30 flex h-[4.5rem] items-center gap-3 border-b border-line bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="flex size-9 cursor-pointer items-center justify-center rounded-control border border-line text-foreground hover:bg-surface-muted lg:hidden"
          >
            <IconMenu />
          </button>

          <p className="text-body font-medium text-foreground">
            {current?.label ?? "Admin"}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-control px-3 py-2 text-caption text-muted transition-colors hover:bg-surface-muted hover:text-foreground sm:inline-flex"
            >
              View site
              <IconExternal />
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {/* One mount point for every action confirmation on every admin page. */}
      <ToastHost />
    </div>
  );
}

/**
 * The brand mark.
 *
 * `/logo.png` is a fixed-colour raster — navy wordmark plus a gold glyph —
 * not a monochrome shape that can be recoloured with `currentColor`. On the
 * dark-mode sidebar the navy sits at roughly 1.3:1 against charcoal and all
 * but disappears, so dark mode gets a light chip behind it. Light mode needs
 * nothing: the mark was drawn for a pale ground.
 *
 * The same problem, and the same fix, as the public header over photography.
 */
function LogoMark({
  logo,
  priority,
}: {
  logo: { url: string; alt: string; width: number; height: number };
  priority?: boolean;
}) {
  return (
    <span className="dark-chip inline-flex rounded-control">
      <Image
        src={logo.url}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority={priority}
        sizes="220px"
        className="h-9 w-auto"
      />
    </span>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  /** Passed by the mobile drawer so tapping a link also closes it. */
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-control px-3 py-2.5 text-body transition-colors",
        "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none",
        active
          ? "bg-accent-tint font-medium text-accent-text"
          : "text-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <span className="shrink-0" aria-hidden="true">
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

const ROLE_LABELS: Record<SessionUser["role"], string> = {
  ADMIN: "Admin",
  SALES: "Sales",
  INVESTOR_MANAGER: "Investor manager",
};

function UserCard({ user }: { user: SessionUser }) {
  const trackSuffix =
    user.role === "SALES" && user.salesTrack
      ? ` · ${user.salesTrack === "BOTH" ? "Both" : user.salesTrack === "LAND" ? "Land" : "Homes"}`
      : "";

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/admin/settings"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-control p-2 transition-colors hover:bg-surface-muted"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-tint text-caption font-medium text-accent-text">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-caption font-medium text-foreground">
            {user.name}
          </span>
          <span className="block truncate text-caption text-muted">
            {ROLE_LABELS[user.role]}
            {trackSuffix}
          </span>
        </span>
      </Link>

      {/*
        Sign out lives here, beside the identity it ends — the place people
        look for it. It was genuinely unreachable before: the card linked to
        Settings, and Settings only offered "Sign out everywhere", which
        revokes every device. Ending a shift on a shared machine should not
        also sign you out on your own phone.
      */}
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none"
        >
          <IconSignOut />
        </button>
      </form>
    </div>
  );
}

/* Inline icons — a handful of 18px strokes, cheaper than an icon dependency. */
const S = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconGrid() {
  return (
    <svg {...S}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg {...S}>
      <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
      <path d="M9 4v13M15 6.5v13" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg {...S}>
      <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg {...S}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg {...S}>
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M4.5 5h15l1.5 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l1.5-7Z" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg {...S}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function IconImage() {
  return (
    <svg {...S}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-4 4 3 3-2 4 3" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg {...S}>
      <path d="M6 3h8l5 5v13a0 0 0 0 1 0 0H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5M8.5 13h7M8.5 17h5" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg {...S}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 5.6M18 20a6.4 6.4 0 0 0-2-4.6" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg {...S}>
      <path d="M12 15V4m0 0L8 8m4-4 4 4" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}
function IconCog() {
  return (
    <svg {...S}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg {...S}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg {...S}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function IconSignOut() {
  return (
    <svg {...S} width={16} height={16}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
function IconExternal() {
  return (
    <svg {...S} width={14} height={14}>
      <path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}
