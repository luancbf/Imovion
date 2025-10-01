import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import CriticalCSS from '@/components/common/CriticalCSS';

// Carregamento assíncrono de componentes não críticos
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), {
  loading: () => null
});

const AnalyticsTracker = dynamic(() => import('@/components/AnalyticsTracker'), {
  loading: () => null
});

const ServiceWorkerRegistration = dynamic(() => import('@/components/ServiceWorkerRegistration'), {
  loading: () => null
});

const ResourcePreloader = dynamic(() => import('@/components/common/ResourcePreloader'), {
  loading: () => null
});

// Otimização de fonte com display swap para FCP mais rápido
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: 'Imovion - Encontre seu imóvel ideal',
  description: 'A melhor plataforma para encontrar imóveis em sua região',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Imovion'
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152' },
      { url: '/icons/icon-180x180.png', sizes: '180x180' }
    ]
  },
  other: {
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preload de recursos críticos */}
        {/* Font já é otimizada pelo Next.js Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//supabase.co" />
        <link rel="dns-prefetch" href="//vercel.com" />
        
        {/* Meta tags de performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body className={inter.className}>
        <CriticalCSS>
          {children}
        </CriticalCSS>
        {/* Componentes condicionais por ambiente */}
        {process.env.NODE_ENV === 'production' && <ResourcePreloader />}
        <CookieConsent />
        {process.env.NODE_ENV === 'production' && <AnalyticsTracker />}
        {process.env.NODE_ENV === 'production' && <ServiceWorkerRegistration />}
        {/* <PerformanceDebugger /> */}
      </body>
    </html>
  );
}
