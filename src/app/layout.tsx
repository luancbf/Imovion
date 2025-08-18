import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Imovion - Encontre seu imóvel ideal',
  description: 'A melhor plataforma para encontrar imóveis em sua região',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <CookieConsent />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
