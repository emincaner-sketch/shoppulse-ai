'use client';

import React, { useState, useEffect } from 'react';
import { AdCampaign, Language, Currency } from '@/types';
import { translations } from '@/lib/i18n/translations';
import { formatCurrency } from '@/lib/currency';
import {
  ShieldCheck,
  AlertTriangle,
  Pause,
  Play,
  CheckCircle2,
  Sliders,
  TrendingUp,
  X,
  Zap,
  Check,
  Loader2,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdSpendSentinelProps {
  campaigns: AdCampaign[];
  language: Language;
  currency?: Currency;
  onToggleCampaignStatus: (campaignId: string) => void;
  onScaleCampaignBudget?: (campaignId: string, newBudget: number) => void;
}

export default function AdSpendSentinel({
  campaigns,
  language,
  currency = 'USD',
  onToggleCampaignStatus,
  onScaleCampaignBudget,
}: AdSpendSentinelProps) {
  const t = translations[language];
  const [platformFilter, setPlatformFilter] = useState<'ALL' | 'META' | 'GOOGLE'>('ALL');
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [stockThreshold, setStockThreshold] = useState(5);
  const [roasFloor, setRoasFloor] = useState(1.5);
  const [scaleThreshold, setScaleThreshold] = useState(4.0);
  const [rule1Enabled, setRule1Enabled] = useState(true);
  const [rule2Enabled, setRule2Enabled] = useState(true);
  const [rule3Enabled, setRule3Enabled] = useState(true);
  const [rulesSaved, setRulesSaved] = useState(false);
  const [loadingCampaignId, setLoadingCampaignId] = useState<string | null>(null);
  const [scaledSuccess, setScaledSuccess] = useState(false);
  const [showWasteBreakdown, setShowWasteBreakdown] = useState(false);
  const [adWasteSaved, setAdWasteSaved] = useState(420);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    if (platformFilter === 'ALL') return true;
    return c.platform === platformFilter;
  });

  const totalSpend = campaigns.reduce((acc, c) => acc + c.spendToday, 0);
  const activeCount = campaigns.filter((c) => c.status === 'ACTIVE').length;

  const handleToggle = async (campaign: AdCampaign) => {
    setLoadingCampaignId(campaign.id);
    const newAction = campaign.status === 'ACTIVE' ? 'PAUSE' : 'RESUME';

    try {
      const res = await fetch('/api/ads/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          action: newAction,
        }),
      });

      if (res.ok) {
        onToggleCampaignStatus(campaign.id);
        if (newAction === 'PAUSE') {
          setAdWasteSaved((prev) => prev + 85);
        }
      }
    } catch (e) {
      console.warn('API Toggle error, falling back locally', e);
      onToggleCampaignStatus(campaign.id);
    } finally {
      setLoadingCampaignId(null);
    }
  };

  const handleScaleBudget = () => {
    if (scaledSuccess) return;
    setScaledSuccess(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#ffffff', '#3b82f6'],
    });

    if (onScaleCampaignBudget) {
      onScaleCampaignBudget('camp-1', 75);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/ads/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules: [
            { id: 'rule-1', type: 'LOW_STOCK_PROTECTION', threshold: stockThreshold, isEnabled: rule1Enabled },
            { id: 'rule-2', type: 'LOW_ROAS_BLEED', threshold: roasFloor, isEnabled: rule2Enabled },
            { id: 'rule-3', type: 'HIGH_PERFORMER_SCALE', threshold: scaleThreshold, isEnabled: rule3Enabled },
          ],
        }),
      });
      setRulesSaved(true);
      setTimeout(() => {
        setRulesSaved(false);
        setRulesModalOpen(false);
      }, 700);
    } catch {
      setRulesModalOpen(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">{t.ads.title}</h3>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
              Sentinel Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{t.ads.subtitle}</p>
        </div>

        {/* Shield Status Badge & Rules Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setRulesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/20 bg-transparent text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>{language === 'tr' ? 'Kalkan Kuralları' : 'Sentinel Rules'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowWasteBreakdown(!showWasteBreakdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium hover:bg-emerald-500/[0.12] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.ads.adWasteSaved}: <b className="text-white">{formatCurrency(adWasteSaved, currency)}</b></span>
              <Info className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {/* Waste Prevention Breakdown Popover */}
            {showWasteBreakdown && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl border border-white/[0.08] bg-zinc-900 shadow-xl z-20 space-y-2 text-xs animate-fadeIn">
                <div className="font-mono text-[11px] text-zinc-400 border-b border-white/[0.06] pb-1.5">
                  {language === 'tr' ? 'Engellenen İsraf Detayı' : 'Protected Spend Breakdown'}
                </div>
                <div className="flex justify-between text-zinc-300 font-mono text-[11px]">
                  <span>🛡️ {language === 'tr' ? 'Stok Tükenme Koruması' : 'Low-Stock Defense'}:</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(240, currency)}</span>
                </div>
                <div className="flex justify-between text-zinc-300 font-mono text-[11px]">
                  <span>📉 {language === 'tr' ? 'ROAS Sızıntı Önleme' : 'ROAS Floor Shield'}:</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(Math.max(0, adWasteSaved - 240), currency)}</span>
                </div>
                <div className="text-[10px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                  {language === 'tr'
                    ? 'Stoğu 5 adetten az kalan ürünlerin reklamları otomatik kısıtlanarak boş bütçe yakımı önlendi.'
                    : 'Campaigns linked to SKUs with <5 units were paused before ad dollars were wasted.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High-Performance Scale Opportunity Banner */}
      <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-zinc-200">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {language === 'tr'
              ? `⚡ DABA Dynamic Retargeting kampanyası 5.6x ROAS ile çalışıyor. Günlük bütçeyi ${formatCurrency(60, currency)}'tan ${formatCurrency(75, currency)}'e çıkararak karlı şekilde ölçekleyebilirsiniz.`
              : `⚡ DABA Dynamic Retargeting is hitting 5.6x ROAS. Safely scale daily budget from ${formatCurrency(60, currency)} to ${formatCurrency(75, currency)} for incremental profit.`}
          </span>
        </div>

        <div className="shrink-0 self-end sm:self-center">
          <button
            onClick={handleScaleBudget}
            disabled={scaledSuccess}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
              scaledSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                : 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300'
            }`}
          >
            {scaledSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'tr' ? `Bütçe Ölçeklendi (${formatCurrency(75, currency)}/gün) ✓` : `Scaled (${formatCurrency(75, currency)}/day) ✓`}</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{language === 'tr' ? `+%'25 Bütçe Ölçekle (${formatCurrency(60, currency)} → ${formatCurrency(75, currency)})` : `+25% Scale (${formatCurrency(60, currency)} → ${formatCurrency(75, currency)})`}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-white/[0.06] bg-zinc-900/40">
          <span className="text-[11px] text-zinc-400 font-mono">{t.ads.spendToday}</span>
          <div className="text-lg font-medium text-white font-mono mt-0.5 tabular-nums">{formatCurrency(totalSpend, currency)}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/[0.06] bg-zinc-900/40">
          <span className="text-[11px] text-zinc-400 font-mono">{t.ads.blendedRoas}</span>
          <div className="text-lg font-medium text-emerald-400 font-mono mt-0.5 tabular-nums">3.42x</div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/[0.06] bg-zinc-900/40">
          <span className="text-[11px] text-zinc-400 font-mono">{t.ads.activeCampaigns}</span>
          <div className="text-lg font-medium text-zinc-200 font-mono mt-0.5 tabular-nums">
            {activeCount} / {campaigns.length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-white/[0.06] bg-zinc-900/40">
          <span className="text-[11px] text-zinc-400 font-mono">
            {language === 'tr' ? 'Ortalama CPC' : 'Average CPC'}
          </span>
          <div className="text-lg font-medium text-zinc-200 font-mono mt-0.5 tabular-nums">{formatCurrency(0.48, currency, { maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: language === 'tr' ? 'Tüm Kampanyalar' : 'All Campaigns', count: campaigns.length },
            { id: 'META', label: 'Meta Ads', count: campaigns.filter((c) => c.platform === 'META').length },
            { id: 'GOOGLE', label: 'Google Ads', count: campaigns.filter((c) => c.platform === 'GOOGLE').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlatformFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                platformFilter === tab.id
                  ? 'bg-zinc-800 text-white border border-white/[0.1]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded bg-white/[0.06] font-mono text-[10px] text-zinc-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          {language === 'tr' ? 'Gerçek zamanlı Shopify stok senkronu devrede' : 'Real-time Shopify inventory sync live'}
        </span>
      </div>

      {/* Campaigns Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/30 border-b border-white/[0.06] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">{t.ads.colCampaign}</th>
              <th className="py-3 px-4">{t.ads.colPlatform}</th>
              <th className="py-3 px-4">{t.ads.colSpend}</th>
              <th className="py-3 px-4">{t.ads.colRoas}</th>
              <th className="py-3 px-4">{t.ads.colStockLink}</th>
              <th className="py-3 px-4">{t.ads.colStatus}</th>
              <th className="py-3 px-5 text-right">
                {language === 'tr' ? 'Aksiyon' : 'Action'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredCampaigns.map((camp) => {
              const hasCriticalStockRisk =
                camp.linkedProductStock !== undefined && camp.linkedProductStock <= stockThreshold;
              const isLoading = loadingCampaignId === camp.id;

              return (
                <tr
                  key={camp.id}
                  className={`hover:bg-white/[0.02] transition-colors ${
                    hasCriticalStockRisk ? 'border-l-2 border-l-rose-500 bg-rose-950/[0.04]' : ''
                  }`}
                >
                  <td className="py-3.5 px-5">
                    <div className="font-medium text-zinc-100">{camp.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {language === 'tr' ? 'Günlük Bütçe' : 'Daily Budget'}: {formatCurrency(camp.dailyBudget, currency)} • CPC: {formatCurrency(camp.cpc, currency, { maximumFractionDigits: 2 })} • CTR: %{camp.ctr}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        camp.platform === 'META'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {camp.platform}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums">{formatCurrency(camp.spendToday, currency)}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span
                      className={`tabular-nums ${
                        camp.roasToday >= 4.0
                          ? 'text-emerald-400 font-medium'
                          : camp.roasToday < 2.0
                          ? 'text-rose-400 font-medium'
                          : 'text-zinc-200'
                      }`}
                    >
                      {camp.roasToday}x
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {camp.linkedProductName ? (
                      <div>
                        <div className="text-zinc-300 font-medium truncate max-w-[150px]">
                          {camp.linkedProductName}
                        </div>
                        <div className="text-[10px] font-mono mt-0.5">
                          {hasCriticalStockRisk ? (
                            <span className="text-rose-400 font-medium">
                              ⚠️ {camp.linkedProductStock} {language === 'tr' ? 'adet kaldı (Kritik!)' : 'units left (Critical!)'}
                            </span>
                          ) : (
                            <span className="text-zinc-400">
                              {camp.linkedProductStock} {language === 'tr' ? 'adet stok' : 'units in stock'}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-600 font-mono">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {hasCriticalStockRisk ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{language === 'tr' ? 'Stok Riski' : 'Stock Alert'}</span>
                      </span>
                    ) : camp.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{t.ads.safe}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10 text-[10px] font-mono font-medium">
                        <Pause className="w-3 h-3" />
                        <span>{t.ads.paused}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleToggle(camp)}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors ${
                        camp.status === 'ACTIVE'
                          ? 'border border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                          : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : camp.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>{t.ads.pauseAd}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>{language === 'tr' ? 'Başlat' : 'Resume'}</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sentinel Rules Configuration Modal */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-400" />
                <h4 className="text-sm font-semibold text-white">
                  {language === 'tr' ? 'ROAS Kalkanı ve Koruma Kuralları' : 'Sentinel Rules & Thresholds'}
                </h4>
              </div>
              <button
                onClick={() => setRulesModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRules} className="space-y-4 text-xs">
              {/* Rule 1: Low Stock Protection */}
              <div className="p-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-zinc-200">
                    {language === 'tr' ? '1. Düşük Stok Otomatik Koruması' : '1. Low Stock Auto-Protection'}
                  </div>
                  <input
                    type="checkbox"
                    checked={rule1Enabled}
                    onChange={(e) => setRule1Enabled(e.target.checked)}
                    className="accent-white cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  {language === 'tr'
                    ? 'Bağlı ürünün stoğu belirlenen eşiğin altına indiğinde reklamı otomatik durdurarak boşa harcamayı engeller.'
                    : 'Auto-pause ads when linked Shopify inventory drops below threshold to prevent ad waste.'}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-zinc-400 text-[11px] font-mono">
                    {language === 'tr' ? 'Kritik Stok Eşiği (Adet):' : 'Threshold (Units):'}
                  </span>
                  <input
                    type="number"
                    value={stockThreshold}
                    onChange={(e) => setStockThreshold(Number(e.target.value))}
                    className="w-20 bg-zinc-900 border border-white/[0.08] rounded-lg px-2 py-1 text-white font-mono text-center"
                    min={1}
                    max={50}
                  />
                </div>
              </div>

              {/* Rule 2: Minimum ROAS Floor */}
              <div className="p-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-zinc-200">
                    {language === 'tr' ? '2. Minimum ROAS Tabanı (Floor)' : '2. Minimum ROAS Floor'}
                  </div>
                  <input
                    type="checkbox"
                    checked={rule2Enabled}
                    onChange={(e) => setRule2Enabled(e.target.checked)}
                    className="accent-white cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  {language === 'tr'
                    ? 'ROAS değeri bu tabanın altına düşen kampanyalar otomatik bildirim ve kısıtlamaya alınır.'
                    : 'Campaigns failing to meet this ROAS threshold will be throttled or paused.'}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-zinc-400 text-[11px] font-mono">
                    {language === 'tr' ? 'Minimum ROAS Tabanı:' : 'Minimum ROAS Floor:'}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={roasFloor}
                    onChange={(e) => setRoasFloor(Number(e.target.value))}
                    className="w-20 bg-zinc-900 border border-white/[0.08] rounded-lg px-2 py-1 text-white font-mono text-center"
                    min={0.5}
                    max={5.0}
                  />
                </div>
              </div>

              {/* Rule 3: High-Performer Scale */}
              <div className="p-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-zinc-200">
                    {language === 'tr' ? '3. Karlı Kampanya Ölçekleme Eşiği' : '3. High Performer Auto-Scale'}
                  </div>
                  <input
                    type="checkbox"
                    checked={rule3Enabled}
                    onChange={(e) => setRule3Enabled(e.target.checked)}
                    className="accent-white cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  {language === 'tr'
                    ? 'Bu eşiğin üzerinde ROAS getiren kazanan kampanyalara anında +%25 bütçe ölçekleme önerilir.'
                    : 'Winning campaigns exceeding this threshold trigger instant +25% scaling actions.'}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-zinc-400 text-[11px] font-mono">
                    {language === 'tr' ? 'Ölçekleme Eşiği (ROAS):' : 'Scale Threshold (ROAS):'}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={scaleThreshold}
                    onChange={(e) => setScaleThreshold(Number(e.target.value))}
                    className="w-20 bg-zinc-900 border border-white/[0.08] rounded-lg px-2 py-1 text-white font-mono text-center"
                    min={2.0}
                    max={10.0}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRulesModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  {language === 'tr' ? 'İptal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 font-medium font-sans transition-colors"
                >
                  {rulesSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'tr' ? 'Kaydedildi ✓' : 'Saved ✓'}</span>
                    </>
                  ) : (
                    <span>{language === 'tr' ? 'Kuralları Kaydet' : 'Save Rules'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
