import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppNavigation } from '@/components/AppNavigation';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#2d8a22',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'CarbonX | Industrial Energy Management',
    template: '%s | CarbonX',
  },
  description:
    'CarbonX — Industrial energy monitoring platform. Real-time machine health, carbon footprint tracking, and AI-powered anomaly detection for manufacturing plants.',
  keywords: ['energy monitoring', 'industrial IoT', 'carbon footprint', 'machine health', 'AI', 'CarbonX'],
  authors: [{ name: 'CarbonX Team' }],
  creator: 'CarbonX',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'CarbonX | Industrial Energy Management',
    description: 'Real-time energy monitoring, carbon footprint tracking, and AI machine health analysis for industrial plants.',
    siteName: 'CarbonX',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/carbon_logo.png" />
        <link rel="apple-touch-icon" href="/carbon_logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CarbonX" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} min-h-screen relative overflow-x-hidden text-gray-900 bg-[#f4f7f5]`} suppressHydrationWarning>
        {/* Creative Background with Large Visible Logo */}
        <div className="fixed inset-0 -z-50 flex flex-col items-center justify-center overflow-hidden pointer-events-none">
            {/* Tech Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
            
            {/* Subtle Glowing Radial Gradient behind logo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(45,138,34,0.05)_0%,_transparent_60%)]" />

            {/* Large Watermark Logo */}
            <img 
                src="/carbon_logo.png" 
                alt="Background Logo" 
                className="w-11/12 max-w-3xl opacity-[0.10] object-contain drop-shadow-md"
            />
        </div>

        <Providers>
          <AuthGuard>
            <PWAInstallBanner />
            <AppNavigation />
            <main className="relative z-10 px-4 md:px-8 pt-28 md:pt-32 max-w-7xl mx-auto min-h-[calc(100vh-80px)] pb-12">
              {children}
            </main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
