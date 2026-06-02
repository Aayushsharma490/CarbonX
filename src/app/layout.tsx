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
      <body className={`${inter.className} min-h-screen relative overflow-x-hidden text-gray-900 bg-white`} suppressHydrationWarning>
        {/* Dynamic Rich Animated Background */}
        <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-50/50">
            {/* Soft Ambient Blobs */}
            <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-green-500/10 blur-[120px] animate-blob mix-blend-multiply" />
            <div className="absolute top-[10%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply" />
            <div className="absolute bottom-[-20%] left-[15%] w-[60vw] h-[60vw] rounded-full bg-emerald-400/10 blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply" />
            <div className="absolute bottom-[10%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-400/5 blur-[120px] animate-blob animation-delay-6000 mix-blend-multiply" />
            
            {/* Elegant Glassmorphic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/60 backdrop-blur-[1px]" />
        </div>

        <Providers>
          <AuthGuard>
            <PWAInstallBanner />
            <AppNavigation />
            <main className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)] pb-12">
              {children}
            </main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
