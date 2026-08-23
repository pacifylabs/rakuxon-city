import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // 06_FEATURE_VIDEO_TOURS.md §5 — the poster fallback for videos with no
        // custom poster uploaded. Routing it through next/image rather than
        // hotlinking also means a visitor who never presses play is never
        // announced to Google, which is most of what the facade is for.
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
