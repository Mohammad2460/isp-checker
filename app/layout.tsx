import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ISP Checker — Which dev services are blocked in India?',
  description:
    'Find out which backend services (Supabase, Firebase, AWS, etc.) your Indian ISP is blocking. Crowdsourced real-time data from developers across India.',
  keywords: ['ISP', 'India', 'blocked', 'Supabase', 'Firebase', 'developer', 'connectivity'],
  openGraph: {
    title: 'Which dev services is your ISP blocking?',
    description: 'Real-time crowdsourced tracker for Indian developers. Test Supabase, Firebase, AWS, Railway + more in under 5 seconds.',
    url: 'https://isp-checker.vercel.app',
    siteName: 'ISP Checker',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Which dev services is your ISP blocking?',
    description: 'Real-time crowdsourced tracker for Indian developers. Test Supabase, Firebase, AWS, Railway + more in under 5 seconds.',
    images: ['/og-image.png'],
    creator: '@saasbyMohd',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
