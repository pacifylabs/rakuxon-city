import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/*
 * Cloudflare Turnstile (src/components/forms/turnstile-widget.tsx) loads its
 * own script and renders its challenge in an iframe, both from Cloudflare's
 * origin — Cloudflare's own CSP guidance names exactly these two directives.
 */
const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

/*
 * `script-src` carries 'unsafe-inline', which sounds like giving up — it is
 * the deliberate choice, not the lazy one. Next's own CSP guide
 * (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md)
 * has exactly two supported paths for inline scripts: a nonce, or
 * 'unsafe-inline'. A nonce was tried first and measured, not assumed:
 *
 *   - React/Next inject their own inline bootstrap and RSC-streaming scripts
 *     (`self.__next_f.push(...)`) on every page, and their content — hence
 *     their hash — differs per request. A static SHA-256 allowlist (tried
 *     here first) blocks every one of them; confirmed live by loading the
 *     homepage and /admin/login with a hash-only policy and reading the
 *     browser console, which showed a fresh CSP violation with a different
 *     hash on every navigation.
 *   - A nonce fixes that, but per Next's own doc: "you must use dynamic
 *     rendering to add nonces" — every page, sitewide, loses static
 *     generation and ISR. That is not a tradeoff this project can make
 *     silently: TODO.md §4.7 measured the homepage and both listing detail
 *     routes at ~4ms prerendered versus 500–1200ms once a page round-trips
 *     to the database, and named fixing that a **launch gate**. Forcing
 *     dynamic rendering everywhere to satisfy script-src would reintroduce
 *     the exact regression that section exists to prevent.
 *
 * So: 'unsafe-inline' for scripts, and everything CSP can still hold a firm
 * line on stays firm — `object-src 'none'`, `base-uri 'self'`,
 * `form-action 'self'` and `frame-ancestors 'none'` block plugin execution,
 * base-tag injection, form-hijacking and clickjacking regardless, and
 * script-src itself still stops an attacker's *externally hosted* script
 * from loading, which is the more common XSS payload shape. The real backstop
 * against inline injection is unchanged: this site does not render
 * user-supplied HTML anywhere (see the comment on `dangerouslySetInnerHTML`
 * in src/components/admin/article-form.tsx) — CSP is defence in depth here,
 * not the only line.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-eval' only in dev: React's dev build uses eval() to reconstruct
  // server-side error stacks in the browser console (Next's own CSP guide
  // notes this explicitly). Never present in a production response.
  `script-src 'self' 'unsafe-inline' ${TURNSTILE_ORIGIN}${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  // Cloudinary for admin-uploaded media (next.config.ts's own remotePatterns
  // above); data: for next/image's inline placeholders.
  "img-src 'self' data: https://res.cloudinary.com",
  "font-src 'self'",
  `connect-src 'self' ${TURNSTILE_ORIGIN}`,
  `frame-src ${TURNSTILE_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Equivalent to, and stronger than, the X-Frame-Options below in every
  // browser that supports it; X-Frame-Options stays for the ones that don't.
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Every route, including /admin and /api — there is no page on this
        // site that should ever be framed, sniffed as a different content
        // type, or leak a full referrer to a third-party link.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          // Only in production: asserting this over plain HTTP in local dev
          // would be actively wrong, and Vercel terminates TLS in front of
          // the app regardless of NODE_ENV, so this is safe to send whenever
          // the app believes it is a production build.
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
  images: {
    /*
     * AVIF ahead of WebP.
     *
     * The homepage LCP is now the hero photograph, and under Lighthouse's
     * simulated slow-4G it competes with 161KB of preloaded fonts for the
     * opening bandwidth. AVIF typically lands 30–50% under WebP at the same
     * visual quality, which is the largest saving available without touching
     * the type stack that design system §3 fixes at two families.
     *
     * Next falls back to WebP automatically where the browser does not accept
     * AVIF, so nothing is lost on older Android.
     */
    formats: ["image/avif", "image/webp"],

    /*
     * Quality settings for image optimization.
     * Hero images use quality 70 for better performance (larger images).
     * Other images use default quality 75.
     */
    qualities: [70, 75],

    /*
     * Optimised variants are cached for a year. They are immutable — the URL
     * carries the source path, width and quality — so a short TTL only means
     * re-encoding the same bytes on every cold hit, which is exactly the
     * "slow on the deployed site" symptom.
     */
    minimumCacheTTL: 31_536_000,

    /*
     * Cloudinary, for images uploaded through the Phase 7 admin.
     *
     * Without this, every admin-uploaded image 404s through next/image while
     * the seeded ones (local files under /public) keep working — a failure
     * mode that only appears after the first real upload, which is exactly
     * when nobody is looking for it.
     *
     * Scoped to Cloudinary's delivery host rather than a wildcard:
     * `next/image` is a fetch-and-re-serve proxy, so a permissive entry here
     * would let any URL be laundered through this domain.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
