import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/app/components/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "Boca Center for Healthy Living | Premium Medical Wellness",
  description:
    "Boca Center for Healthy Living offers personalized hormone therapy, longevity medicine, IV therapy, and cutting-edge wellness technologies in Boca Raton, Florida.",
  keywords: "hormone therapy, longevity medicine, IV therapy, weight management, functional medicine, Boca Raton",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
