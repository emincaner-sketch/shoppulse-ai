import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ShopPulse AI — Shopify İşletme Yöneticisi & AI Satış Koçu',
  description: 'Shopify mağazanızın satışlarını artırın, rakiplerinizi gerçek zamanlı takip edin, reklam harcamalarınızı optimize edin.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#09090b] text-[#fafafa] selection:bg-zinc-800 selection:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
