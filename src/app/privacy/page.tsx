'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, RefreshCw, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const isTr = lang === 'tr';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-white/20">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isTr ? 'ShopPulse AI Paneline Dön' : 'Return to Dashboard'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(isTr ? 'en' : 'tr')}
              className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-zinc-900 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
            >
              {isTr ? 'English' : 'Türkçe'}
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Shopify GDPR Certified</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Title */}
        <div className="border-b border-white/[0.08] pb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-2">
            ShopPulse AI Legal • Security & Compliance
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            {isTr ? 'Gizlilik Politikası ve Veri Güvenliği' : 'Privacy Policy & Data Protection'}
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            {isTr ? 'Son Güncelleme: 7 Eylül 2026 • Sürüm 2.4' : 'Last Updated: September 7, 2026 • Version 2.4'}
          </p>
        </div>

        {/* Section 1: Overview */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121215] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2>{isTr ? '1. Veri Gizliliği Taahhüdümüz' : '1. Privacy Commitment'}</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {isTr
              ? 'ShopPulse AI ("Uygulama"), Shopify mağaza sahiplerinin e-ticaret verilerini analiz etmek ve yapay zeka destekli büyüme içgörüleri üretmek amacıyla kurulmuştur. Mağaza verileriniz, siparişleriniz ve müşteri analitikleriniz en yüksek gizlilik ilkeleriyle korunur; hiçbir koşulda üçüncü taraflara satılmaz veya rakip mağazalarla doğrudan paylaşılmaz.'
              : 'ShopPulse AI ("Application") is engineered to empower Shopify merchants with growth intelligence and financial analytics. Your store data, order history, and customer metrics are strictly protected, never sold, and never shared directly with competitor stores.'}
          </p>
        </div>

        {/* Section 2: Data Collected & Encryption */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121215] space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <Database className="w-4 h-4 text-emerald-400" />
            <h2>{isTr ? '2. Toplanan Veriler ve Şifreleme Standartları' : '2. Data Collection & Cryptographic Standards'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
              <span className="font-semibold text-zinc-200 block mb-1">
                {isTr ? 'Hassas Erişim Tokenları' : 'Sensitive Access Tokens'}
              </span>
              <p className="text-zinc-400 leading-relaxed">
                {isTr
                  ? 'Shopify OAuth access tokenları ve reklam API anahtarları veritabanında AES-256-GCM standardı ile şifrelenerek saklanır.'
                  : 'Shopify OAuth credentials and ad tokens are stored encrypted using AES-256-GCM with individual IVs.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
              <span className="font-semibold text-zinc-200 block mb-1">
                {isTr ? 'Analitik ve Sipariş Verisi' : 'Order & Inventory Analytics'}
              </span>
              <p className="text-zinc-400 leading-relaxed">
                {isTr
                  ? 'Ürün stokları, satış hızları ve ciro metrikleri BCG matrisi ve AI koç analizi için işlenir. Müşteri PII verileri minimumda tutulur.'
                  : 'Catalog, order velocity, and margins are processed for BCG classification. Customer PII is minimized.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Shopify Mandatory GDPR Webhooks */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121215] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <h2>{isTr ? '3. Shopify Zorunlu GDPR Webhook Uyumluluğu' : '3. Shopify Mandatory GDPR Compliance'}</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {isTr
              ? 'ShopPulse AI, Shopify Partner API zorunlu GDPR gereksinimlerini eksiksiz yerine getirmektedir:'
              : 'ShopPulse AI fully complies with mandatory Shopify Partner GDPR webhook requirements:'}
          </p>
          <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside">
            <li>
              <strong className="text-white">customers/data_request:</strong>{' '}
              {isTr
                ? 'Müşteri veri talepleri 24 saat içinde işlenerek ilgili mağazaya raporlanır.'
                : 'Customer data export requests are acknowledged and processed within 24 hours.'}
            </li>
            <li>
              <strong className="text-white">customers/redact:</strong>{' '}
              {isTr
                ? 'Müşteri verisi silme talepleri tüm sistemlerimizden anında silinir.'
                : 'Customer PII redaction webhooks permanently purge corresponding entries.'}
            </li>
            <li>
              <strong className="text-white">shop/redact:</strong>{' '}
              {isTr
                ? 'Uygulama kaldırıldığında, mağazanın tüm verileri ve tokenları 48 saat içinde veritabanından kalıcı olarak tasfiye edilir.'
                : 'Upon app uninstallation, all store data and encrypted tokens are permanently purged within 48 hours.'}
            </li>
          </ul>
        </div>

        {/* Section 4: Contact & DPO */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121215] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <Mail className="w-4 h-4 text-emerald-400" />
            <h2>{isTr ? '4. İletişim ve Veri Koruma Görevlisi (DPO)' : '4. Contact & Data Protection Officer'}</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {isTr
              ? 'Gizlilik politikamız veya veri haklarınız ile ilgili her türlü soru için Veri Koruma Görevlimize dpo@shoppulse.ai adresinden ulaşabilirsiniz.'
              : 'For any inquiries regarding data protection, reach out directly to our Data Protection Officer at dpo@shoppulse.ai.'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-6 text-center text-xs text-zinc-400 font-mono">
        © 2026 ShopPulse AI Inc. All rights reserved.
      </footer>
    </div>
  );
}
