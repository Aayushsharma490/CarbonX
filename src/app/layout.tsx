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
    default: 'CarbonX | Carbon Intelligence Platform',
    template: '%s | CarbonX',
  },
  description:
    'CarbonX — Carbon Intelligence Platform. From Individual Choices to Industrial Decisions. Deterministic carbon calculation, explainable uncertainty bounds, and IoT machine health monitoring.',
  keywords: ['carbon intelligence', 'carbon footprint', 'carbon decision engine', 'energy monitoring', 'industrial IoT', 'emission factors', 'CarbonX'],
  authors: [{ name: 'CarbonX Team' }],
  creator: 'CarbonX',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'CarbonX | Carbon Intelligence Platform',
    description: 'From Individual Choices to Industrial Decisions. Precision carbon calculations and industrial energy monitoring.',
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
      <body className={`${inter.className} min-h-screen relative overflow-x-hidden text-gray-900 bg-[#f9fbf9] antialiased text-[15px]`} suppressHydrationWarning>
        {/* Subtle Transparent CarbonX Background Watermark (No Grid) */}
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {/* Subtle Radial Glow */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 40%, rgba(45,138,34,0.03) 0%, transparent 70%)',
            }}
          />

          {/* Light Opacity Centered CarbonX Logo */}
          <img 
            src="/carbon_logo.png" 
            alt="" 
            style={{
              width: '560px',
              maxWidth: '85vw',
              opacity: 0.035,
              objectFit: 'contain',
              userSelect: 'none',
              filter: 'grayscale(30%)',
            }}
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
