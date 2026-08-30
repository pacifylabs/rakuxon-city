import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The shell every signed-out admin screen sits in — sign in, forgot password,
 * set a new password.
 *
 * Two panels at `lg`: the form on the left, and a charcoal panel on the right
 * carrying the brand and a line about what this actually is. The right panel
 * is decorative and disappears below `lg`, so a phone gets the form at full
 * width with nothing competing for the fold.
 */
export function AuthLayout({
  logo,
  title,
  description,
  children,
  footer,
}: {
  logo: { url: string; alt: string; width: number; height: number };
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" aria-label="Rakuxon City">
            {/* Light chip in dark mode — the mark is a fixed navy raster and
                all but vanishes on the charcoal ground otherwise. */}
            <span className="dark-chip inline-flex rounded-control">
              <Image
                src={logo.url}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                priority
                sizes="220px"
                className="h-9 w-auto"
              />
            </span>
          </Link>

          <h1 className="mt-10 text-display-m text-foreground">{title}</h1>
          {description ? (
            <p className="mt-2 text-body text-muted">{description}</p>
          ) : null}

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-8">{footer}</div> : null}
        </div>
      </div>

      <div className="relative hidden flex-col justify-between bg-charcoal p-12 lg:flex">
        <div />
        <div>
          <p className="max-w-[24ch] text-display-m text-ivory-light">
            Land and homes, with the papers in order.
          </p>
          <p className="mt-6 max-w-[42ch] text-body text-ivory-light/70">
            The staff console for listings, estates, enquiries and the buyer
            guides. Everything published here reaches the public site
            immediately.
          </p>
        </div>
        <p className="text-caption text-ivory-light/50">
          © {new Date().getFullYear()} Rakuxon City
        </p>
      </div>
    </div>
  );
}
