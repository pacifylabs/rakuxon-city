import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
