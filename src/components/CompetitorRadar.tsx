'use client';

import React, { useState } from 'react';
import { CompetitorStore, Language, Currency } from '@/types';
import { translations } from '@/lib/i18n/translations';
import { formatCurrency } from '@/lib/currency';
import {
  Radar,
  ExternalLink,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  DollarSign,
  Layers,
  Flame,
  Video,
  Play,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface CompetitorRadarProps {
  competitors: CompetitorStore[];
  language: Language;
  currency?: Currency;
  onAddCompetitor: (domain: string) => void;
  onApplyArbitrage?: (productTitle: string, newPrice: number) => void;
  onUpdateProductPrice?: (productTitle: string, newPrice: number) => void;
}

export default function CompetitorRadar({
  competitors,
  language,
  currency = 'USD',
  onAddCompetitor,
  onApplyArbitrage,
  onUpdateProductPrice,
}: CompetitorRadarProps) {
  const t = translations[language];
  const [newDomain, setNewDomain] = useState('');
  const [selectedCompId, setSelectedCompId] = useState<string>(competitors[0]?.id || '');
  const [activeView, setActiveView] = useState<'catalog' | 'metaAds'>('catalog');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStep, setScrapeStep] = useState(0);
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanSuccess, setRescanSuccess] = useState(false);
  const [arbitrageApplied, setArbitrageApplied] = useState(false);
  const [appliedDisparities, setAppliedDisparities] = useState<Record<string, boolean>>({});
  const [copiedHook, setCopiedHook] = useState<string | null>(null);
  const [aiAdaptedHook, setAiAdaptedHook] = useState<string | null>(null);

  const activeComp = competitors.find((c) => c.id === selectedCompId) || competitors[0];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = newDomain.trim().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (!cleanDomain || isScraping) return;

    setIsScraping(true);
    setScrapeStep(1);

    // Simulated 4-step scraping progress for high UX realism
    setTimeout(() => setScrapeStep(2), 500);
    setTimeout(() => setScrapeStep(3), 1100);
    setTimeout(() => {
      setScrapeStep(4);
      onAddCompetitor(cleanDomain);
      setTimeout(() => {
        setIsScraping(false);
        setScrapeStep(0);
        setNewDomain('');
      }, 400);
    }, 1700);
  };

  const handleRescan = () => {
    if (isRescanning) return;
    setIsRescanning(true);
    setTimeout(() => {
      setIsRescanning(false);
      setRescanSuccess(true);
      setTimeout(() => setRescanSuccess(false), 2000);
    }, 900);
  };

  const handleExecuteArbitrage = () => {
    if (arbitrageApplied) return;
    setArbitrageApplied(true);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#f59e0b', '#ffffff'],
    });
    if (onApplyArbitrage) {
      onApplyArbitrage('Chelsea Bot', 139);
    }
  };

  const handleApplyDisparity = (productTitle: string, targetPrice: number, key: string) => {
    setAppliedDisparities((prev) => ({ ...prev, [key]: true }));
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.75 },
    });
    if (onUpdateProductPrice) {
      onUpdateProductPrice(productTitle, targetPrice);
    }
  };

  const handleCopyHook = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(text);
    setTimeout(() => setCopiedHook(null), 1800);
  };

  const handleAdaptHook = (hook: string) => {
    if (aiAdaptedHook === hook) {
      setAiAdaptedHook(null);
    } else {
      setAiAdaptedHook(hook);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-sm space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">{t.competitors.title}</h3>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 font-mono text-[10px] border border-white/[0.08]">
              {competitors.length} {language === 'tr' ? 'Rakip İzleniyor' : 'Competitors Tracked'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{t.competitors.subtitle}</p>
        </div>

        {/* Add Competitor Input */}
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            disabled={isScraping}
            placeholder={t.competitors.enterDomain}
            className="bg-zinc-900 border border-white/[0.08] hover:border-white/[0.14] focus:border-white/25 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition-colors font-mono disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isScraping || !newDomain.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isScraping ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{language === 'tr' ? 'Taranıyor...' : 'Scanning...'}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t.competitors.addBtn}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Scraping Progress Stepper (Visible during scrape) */}
      {isScraping && (
        <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/60 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between font-mono text-zinc-300">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              <span>{language === 'tr' ? `Rakip Taranıyor: ${newDomain}` : `Scanning Competitor: ${newDomain}`}</span>
            </span>
            <span className="text-[11px] text-zinc-500">Adım {scrapeStep}/4</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <div className={`h-1 rounded-full ${scrapeStep >= 1 ? 'bg-white' : 'bg-zinc-800'}`} />
            <div className={`h-1 rounded-full ${scrapeStep >= 2 ? 'bg-white' : 'bg-zinc-800'}`} />
            <div className={`h-1 rounded-full ${scrapeStep >= 3 ? 'bg-white' : 'bg-zinc-800'}`} />
            <div className={`h-1 rounded-full ${scrapeStep >= 4 ? 'bg-white' : 'bg-zinc-800'}`} />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            {scrapeStep === 1 && (language === 'tr' ? '1. Shopify altyapısı ve sitemap inceleniyor...' : '1. Validating Shopify sitemap & domain...')}
            {scrapeStep === 2 && (language === 'tr' ? '2. /products.json çekildi, en çok satanlar filtreleniyor...' : '2. Parsing /products.json & top sellers...')}
            {scrapeStep === 3 && (language === 'tr' ? '3. Meta Ad Library aktif kreatifleri sorgulanıyor...' : '3. Inspecting Meta Ad Library active creatives...')}
            {scrapeStep === 4 && (language === 'tr' ? '4. Ürün eşleştirme & arbitraj fırsatları hesaplandı!' : '4. Price arbitrage & product matching completed!')}
          </div>
        </div>
      )}

      {/* Stockout Arbitrage Opportunity Callout */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 text-zinc-200">
          <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-amber-300 flex items-center gap-2">
              <span>{language === 'tr' ? '⚡ Kritik Arbitraj Fırsatı Tespit Edildi' : '⚡ High-Impact Arbitrage Detected'}</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px]">
                +{formatCurrency(1530, currency)} / {language === 'tr' ? 'Ay' : 'Mo'}
              </span>
            </div>
            <p className="text-zinc-300 mt-1 text-[11px] leading-relaxed">
              {language === 'tr'
                ? `"ZaraStyle" mağazasında Chelsea Bot tükendi. Sizde 32 adet stok var. Fiyatı ${formatCurrency(129, currency)}'den ${formatCurrency(139, currency)}'a çıkararak sepet terk oranı artmadan net marjınızı genişletebilirsiniz.`
                : `"ZaraStyle" stocked out on Chelsea Boots. You hold 32 units. Safely lift price from ${formatCurrency(129, currency)} to ${formatCurrency(139, currency)} to expand margins without hurting conversions.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={handleExecuteArbitrage}
            disabled={arbitrageApplied}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              arbitrageApplied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                : 'bg-amber-400 text-zinc-950 hover:bg-amber-300 font-medium'
            }`}
          >
            {arbitrageApplied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'tr' ? `Fiyat Güncellendi (${formatCurrency(139, currency)}) ✓` : `Price Updated (${formatCurrency(139, currency)}) ✓`}</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{language === 'tr' ? `Fiyatı Optimize Et (${formatCurrency(129, currency)} → ${formatCurrency(139, currency)})` : `Optimize Price (${formatCurrency(129, currency)} → ${formatCurrency(139, currency)})`}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Competitor Select Tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          {competitors.map((comp) => {
            const isSelected = comp.id === activeComp?.id;
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedCompId(comp.id)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left transition-all shrink-0 ${
                  isSelected
                    ? 'border-white/20 bg-zinc-850 text-white'
                    : 'border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-white/[0.1]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-zinc-200">{comp.brandName}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 font-mono">
                    <span>{comp.domain}</span>
                    <span>•</span>
                    <span className="text-zinc-400">{comp.activeMetaAds} aktif reklam</span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Rescan Button for Active Competitor */}
          <button
            onClick={handleRescan}
            disabled={isRescanning}
            title={language === 'tr' ? 'Fiyatları ve reklamları yeniden tara' : 'Rescan prices and ad library'}
            className="p-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin text-white' : ''}`} />
          </button>
          {rescanSuccess && (
            <span className="text-[11px] text-emerald-400 font-mono animate-fadeIn">
              {language === 'tr' ? 'Canlı Güncellendi ✓' : 'Synced Live ✓'}
            </span>
          )}
        </div>

        {/* View Switcher: Catalog vs Meta Ad Spy */}
        <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-white/[0.06] shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveView('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeView === 'catalog' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
            <span>{language === 'tr' ? 'Fiyat & Katalog' : 'Price & Catalog'}</span>
          </button>
          <button
            onClick={() => setActiveView('metaAds')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeView === 'metaAds' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="w-3 h-3 text-zinc-400" />
            <span>Meta Ad Spy</span>
            <span className="px-1 py-0.2 rounded bg-white/[0.08] text-[9px] font-mono">
              {activeComp?.activeMetaAds || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Active Competitor Details - Catalog View */}
      {activeComp && activeView === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
          {/* 2 Cols: Price Disparities & Live Match Actions */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                <span>{t.competitors.priceDisparities}</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {language === 'tr' ? 'Otomatik Eşleşen Ürünler' : 'Auto-Matched SKUs'}
              </span>
            </h4>

            <div className="space-y-2.5">
              {activeComp.priceDisparities.map((item, idx) => {
                const diff = item.competitorPrice - item.ourPrice;
                const isCompetitorHigher = diff > 0;
                const disparityKey = `${activeComp.id}-${idx}`;
                const isApplied = appliedDisparities[disparityKey];

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/[0.06] bg-zinc-900/30 hover:border-white/[0.1] transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-200">{item.productTitle}</span>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-zinc-400">
                          {t.competitors.ourPrice}:{' '}
                          <span className="text-zinc-200">
                            {formatCurrency(isApplied && isCompetitorHigher ? item.ourPrice + 3 : item.ourPrice, currency)}
                          </span>
                        </span>
                        <span className="text-zinc-400">
                          {t.competitors.compPrice}: <span className="text-zinc-200">{formatCurrency(item.competitorPrice, currency)}</span>
                        </span>
                        <span
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            isCompetitorHigher
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isCompetitorHigher ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          <span>{formatCurrency(Math.abs(diff), currency)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-850/60 border border-white/[0.04] text-[11px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
                        <span>{item.recommendation[language]}</span>
                      </div>

                      {isCompetitorHigher && (
                        <button
                          onClick={() => handleApplyDisparity(item.productTitle, item.ourPrice + 3, disparityKey)}
                          disabled={isApplied}
                          className={`shrink-0 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                            isApplied
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                              : 'bg-white text-zinc-900 hover:bg-zinc-200'
                          }`}
                        >
                          {isApplied
                            ? (language === 'tr' ? 'Eşitlendi ✓' : 'Updated ✓')
                            : (language === 'tr' ? `Fiyatı ${formatCurrency(item.ourPrice + 3, currency)}'e Çek` : `Set to ${formatCurrency(item.ourPrice + 3, currency)}`)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1 Col: Best-Selling Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>{t.competitors.bestSellers}</span>
              </span>
              <span className="text-[10px] text-zinc-400">Shopify /products.json</span>
            </h4>

            <div className="space-y-2.5">
              {activeComp.topSellingProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-zinc-900/30 hover:border-white/[0.1] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {prod.imageUrl && (
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-zinc-850 shrink-0 border border-white/[0.06]">
                        <Image
                          src={prod.imageUrl}
                          alt={prod.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium text-zinc-200 truncate max-w-[130px]">
                        {prod.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">{formatCurrency(prod.price, currency)}</div>
                    </div>
                  </div>

                  <div>
                    {prod.status === 'out_of_stock' ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-medium">
                        {language === 'tr' ? 'Tükendi' : 'Out of Stock'}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10 text-[10px] font-mono font-medium">
                        {language === 'tr' ? 'Stokta' : 'In Stock'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Meta Ad Spy Tab View */}
      {activeComp && activeView === 'metaAds' && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Format Breakdown */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-zinc-900/30 space-y-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                {language === 'tr' ? 'Kreatif Format Dağılımı' : 'Ad Format Distribution'}
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-300 mb-1 font-mono text-[11px]">
                    <span>UGC Video (Reels/TikTok)</span>
                    <span>%65</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-zinc-300 mb-1 font-mono text-[11px]">
                    <span>Carousel (Döngü Reklam)</span>
                    <span>%25</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-400 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-zinc-300 mb-1 font-mono text-[11px]">
                    <span>Statik Tekil Görsel</span>
                    <span>%10</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-600 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Ad Tracker Deep-Dive */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-zinc-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                  {language === 'tr' ? 'Kazanan Reklam (Winner Ad)' : 'Winning Ad Creative'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                  {language === 'tr' ? '48 Gündür Yayında' : 'Active 48 Days'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-850/50 border border-white/[0.04] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-white/[0.08]">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="text-[11px]">
                  <div className="font-medium text-zinc-200">
                    {language === 'tr' ? 'Kış Koleksiyonu Unboxing & Doku İncelemesi' : 'Winter Unboxing & Texture Showcase'}
                  </div>
                  <div className="text-zinc-400 font-mono text-[10px]">Format: 9:16 Reels • $2,400+ Tahmini Harcama</div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {language === 'tr'
                  ? 'Son 48 gündür aralıksız bütçe alıyor. Rakibin ana müşteri kazanım motorudur.'
                  : 'Has received consistent spend for 48 consecutive days. Core acquisition asset.'}
              </p>
            </div>

            {/* Winning Copy Hooks */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-zinc-900/30 space-y-2.5">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                {language === 'tr' ? 'En Çok Satan Reklam Kancaları' : 'Top Performing Copy Hooks'}
              </span>
              <ul className="space-y-2 text-xs">
                {[
                  'Kaşındırmayan lüks yün garantisi',
                  '1.200+ 5 Yıldızlı Müşteri İncelemesi',
                  '2. Ürüne Sepette %30 İndirim Kodu',
                ].map((hook, i) => {
                  const isCopied = copiedHook === hook;
                  return (
                    <li
                      key={i}
                      className="p-2 rounded-lg bg-zinc-850/60 border border-white/[0.04] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 text-zinc-200 text-[11px] truncate">
                        <Sparkles className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">&quot;{hook}&quot;</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopyHook(hook)}
                          title={language === 'tr' ? 'Panoya Kopyala' : 'Copy Hook'}
                          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => handleAdaptHook(hook)}
                          className="px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white text-[10px] font-mono transition-colors"
                        >
                          {language === 'tr' ? 'Uyarla' : 'Adapt'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* AI Hook Adaptation Preview Box */}
          {aiAdaptedHook && (
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/60 flex items-start gap-3 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-mono text-[11px] text-zinc-400">
                  {language === 'tr' ? 'AI Mağaza Uyarlaması (Lumina Fashion İçin):' : 'AI Adaptation (For Lumina Fashion):'}
                </div>
                <div className="text-zinc-200 font-medium">
                  {aiAdaptedHook.includes('Kaşındırmayan')
                    ? (language === 'tr' ? '👉 "Cildinize ipeksi dokunuş: %100 Doğal İtalyan Merinos Hırkalarımızla kışı terlemeden ve kaşınmadan geçirin."' : '👉 "Silky touch on your skin: 100% Organic Merino Wool cardigans without itch or bulk."')
                    : aiAdaptedHook.includes('1.200+')
                    ? (language === 'tr' ? '👉 "İstanbul ve Londra\'dan 1.450+ Doğrulanmış Müşteri Puanı: Neden gardırobunuzun vazgeçilmezi olacak?"' : '👉 "1,450+ Verified Merchant Ratings: Why this becomes your capsule wardrobe cornerstone."')
                    : (language === 'tr' ? '👉 "Kapsül Gardırop Teklifi: Seçili trikolarla sepette 2. ürüne anında %30 indirim."' : '👉 "Capsule Bundle Offer: 30% off your second knitwear staple applied automatically at checkout."')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
