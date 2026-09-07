'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, CreditCard, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
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
              <Scale className="w-3.5 h-3.5" />
              <span>Shopify Terms Compliant</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Title */}
        <div className="border-b border-white/[0.08] pb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-2">
            ShopPulse AI Legal • Terms & Conditions
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            {isTr ? 'Hizmet Kullanım Şartları' : 'Terms of Service'}
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            {isTr ? 'Son Güncelleme: 7 Eylül 2026 • Sürüm 2.4' : 'Last Updated: September 7, 2026 • Version 2.4'}
          </p>
        </div>

        {/* Section 1: Acceptance */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121215] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h2>{isTr ? '1. Koşulların Kabulü' : '1. Acceptance of Terms'}</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {isTr
              ? 'ShopPulse AI uygulamasını Shopify mağazanıza yükleyerek veya SaaS platformumuza abone olarak bu Hizmet Şartlarını kabul etmiş sayılırsınız. Uygulama, e-ticaret analitiği ve büyüme koçluğu sunan bir B2B yazılım hizmetidir (SaaS).'
              : 'By installing ShopPulse AI on your Shopify store or subscribing to our SaaS platform, you agree to be bound by these Terms of Service. ShopPulse AI provides automated analytics and algorithmic growth insights for merchants.'}
          </p>
        </div>

        {/* Section 2: Subscriptions & Billing */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121215] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h2>{isTr ? '2. Faturalandırma, İptal ve İadeler' : '2. Subscriptions, Billing & Cancellations'}</h2>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">{isTr ? 'Shopify App Billing:' : 'Shopify App Billing:'}</strong>{' '}
              {isTr
                ? 'Shopify App Store üzerinden yapılan abonelikler doğrudan Shopify faturanıza 30 günlük döngülerle yansıtılır.'
                : 'Subscriptions initiated via the Shopify App Store are billed via Shopify recurring charges every 30 days.'}
            </li>
            <li>
              <strong className="text-white">{isTr ? 'Stripe Checkout:' : 'Stripe Checkout:'}</strong>{' '}
              {isTr
                ? 'Bağımsız SaaS kullanıcıları için ödemeler Stripe güvencesiyle aylık veya yıllık (%20 indirimli) olarak tahsil edilir.'
                : 'Standalone accounts are billed via Stripe Checkout with monthly or annual options.'}
            </li>
            <li>
              <strong className="text-white">{isTr ? 'İptal Politikası:' : 'Cancellation Policy:'}</strong>{' '}
              {isTr
                ? 'Aboneliğinizi Shopify Admin panelinden uygulamayı kaldırarak veya ayarlar menüsünden dilediğiniz an tek tıkla sonlandırabilirsiniz.'
                : 'You may cancel anytime directly from your Shopify Admin or billing settings modal.'}
            </li>
          </ul>
        </div>

        {/* Section 3: AI Disclaimer */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121215] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h2>{isTr ? '3. Yapay Zeka Tavsiyeleri Sorumluluk Reddi' : '3. AI Recommendations Disclaimer'}</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {isTr
              ? 'ShopPulse AI Satış Koçu ve Fiyat Arbitrajı motoru istatistiksel olasılıklar ve pazar verileriyle çalışır. Nihai fiyatlama, stok ve reklam bütçesi kararları mağaza sahibinin sorumluluğundadır. Yazılımımız doğrudan kar veya ciro garantisi taahhüt etmez.'
              : 'AI Coach insights and price arbitrage models calculate probabilistic margins based on current signals. Final pricing and inventory decisions remain under merchant authority. ShopPulse AI makes no direct revenue guarantee.'}
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
