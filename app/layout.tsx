import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Navigation from '@/components/Navigation';
import Grain from '@/components/Grain';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bocamed.com'),
  title: 'Boca Center for Healthy Living — Your Journey Toward Optimal Health',
  description:
    'Premier functional, longevity, and hormone optimization medicine in South Florida. A transformational wellness experience guided by Dr. Merna Matilsky.',
  keywords: [
    'functional medicine Boca Raton',
    'longevity medicine',
    'hormone optimization',
    'EvexiPEL',
    'bioidentical hormone therapy',
    'concierge medicine',
    'Alma TED hair restoration',
    'preventive medicine South Florida',
  ],
  openGraph: {
    title: 'Boca Center for Healthy Living',
    description: 'Health begins beneath the surface.',
    url: 'https://www.bocamed.com',
    siteName: 'Boca Center for Healthy Living',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0e12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="grain antialiased">
        <Grain />
        <SmoothScroll>
          <Navigation />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
