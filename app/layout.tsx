import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Boca Center for Healthy Living | Longevity Medicine, Hormone Optimization & Regenerative Therapies in Boca Raton",
  description:
    "Boca Center for Healthy Living is a luxury longevity clinic in Boca Raton, FL led by Dr. Merna Matilsky. We uncover root causes — offering EvexiPEL® pellet therapy, bio-identical hormone replacement, physician-guided medical weight loss, functional and preventative medicine, and Alma TED™ hair restoration. Begin your journey to vitality: (561) 994-2007.",
  keywords: [
    "longevity medicine Boca Raton",
    "hormone optimization",
    "EvexiPEL pellet therapy",
    "bio-identical hormone replacement therapy",
    "BHRT Boca Raton",
    "medical weight loss",
    "Alma TED hair restoration",
    "regenerative therapies",
    "functional medicine",
    "preventative medicine",
    "Dr. Merna Matilsky",
    "Boca Center for Healthy Living",
  ],
  openGraph: {
    title: "Boca Center for Healthy Living — Your Journey to Vitality",
    description:
      "A luxury longevity clinic in Boca Raton, FL. Root-cause medicine, hormone optimization, medical weight loss, and regenerative therapies led by Dr. Merna Matilsky.",
    type: "website",
    locale: "en_US",
    siteName: "Boca Center for Healthy Living",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boca Center for Healthy Living — Your Journey to Vitality",
    description:
      "Longevity medicine, hormone optimization & regenerative therapies in Boca Raton, FL.",
  },
};

const clinicSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "Boca Center for Healthy Living",
  description:
    "Luxury longevity clinic in Boca Raton, FL offering hormone optimization, EvexiPEL pellet therapy, bio-identical hormone replacement, medical weight loss, longevity medicine, and regenerative therapies including Alma TED hair restoration.",
  telephone: "+1-561-994-2007",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Boca Raton",
    addressRegion: "FL",
    addressCountry: "US",
  },
  medicalSpecialty: ["Endocrinologic", "PrimaryCare", "Dermatologic"],
  founder: {
    "@type": "Physician",
    name: "Dr. Merna Matilsky",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
