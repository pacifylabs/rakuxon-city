import type { Metadata } from "next";
import { Instrument_Sans, Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { organisationJsonLd, websiteJsonLd } from "@/lib/schema";
import { origin } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

/* 04_DESIGN_SYSTEM.md §3 — two faces, two weights. 600 and 700 are never
   loaded, so bold is not available to reach for by accident. */
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const description =
  "Serviced plots and completed homes across Lagos, Ogun and the FCT. Every listing shows its title type and its documentation before it shows a price.";

export const metadata: Metadata = {
  metadataBase: new URL(origin()),
  title: {
    default: "Rakuxon City — land and homes, with the papers in order",
    // Every page below sets a bare title and gets the brand appended once.
    template: `%s — ${site.name}`,
  },
  description,
  applicationName: site.name,
  referrer: "origin-when-cross-origin",
  keywords: [
    "land for sale in Lagos",
    "buy land in Nigeria",
    "Ogun state land",
    "Abuja property",
    "Certificate of Occupancy",
    "serviced plots",
    "estate development Nigeria",
  ],
  authors: [{ name: site.name, url: origin() }],
  creator: site.name,
  publisher: site.name,
  formatDetection: { telephone: true, address: false, email: true },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: site.name,
    url: origin(),
    title: "Rakuxon City — land and homes, with the papers in order",
    description,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-NG"
      className={`${instrumentSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Site-wide graph. Page-level types reference these by @id rather
            than repeating the organisation on every page. */}
        <JsonLd data={organisationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
