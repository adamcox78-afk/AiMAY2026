import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Apex Signal converts complex market data into one clear call: LONG, SHORT, or WAIT — with confidence, probabilities, and a plain-English explanation. Stop decoding markets.",
  applicationName: BRAND.name,
  keywords: ["trading signals", "probability", "market intelligence", "crypto", "stocks", "fintech"],
  openGraph: { title: BRAND.name, description: BRAND.tagline, type: "website" },
  metadataBase: new URL("https://apexsignal.app"),
};

export const viewport: Viewport = {
  themeColor: "#070A0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
