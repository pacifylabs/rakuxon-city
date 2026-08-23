import type { Metadata } from "next";
import { Instrument_Sans, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Rakuxon City",
  description:
    "Land and homes in Nigeria, sold with the title documentation shown up front.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/*
          Marks the document as JavaScript-capable before first paint, so the
          scroll-reveal rule in globals.css can hide content only where it will
          actually be revealed again. Without it, a visitor with JavaScript
          blocked reads a page of empty space.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.js="true"`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
