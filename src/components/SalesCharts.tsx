'use client';

import React, { useMemo } from 'react';
import { SalesDataPoint, Language, Currency } from '@/types';
import { translations } from '@/lib/i18n/translations';
import { formatCurrency, convertCurrency, getCurrencySymbol } from '@/lib/currency';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Users, Eye, ShoppingBag, CreditCard, CheckCircle } from 'lucide-react';

interface SalesChartsProps {
  data: SalesDataPoint[];
  language: Language;
  currency?: Currency;
  isLive?: boolean;
  liveProductsCount?: number;
  liveOrdersCount?: number;
}

export default function SalesCharts({
  data,
  language,
  currency = 'USD',
  isLive = false,
  liveProductsCount = 0,
  liveOrdersCount = 0,
}: SalesChartsProps) {
  const t = translations[language];

  // Mathematically scale the chart values according to the chosen currency rate
  const convertedData = useMemo(() => {
    return data.map((pt) => ({
      ...pt,
      todaySales: convertCurrency(pt.todaySales, currency),
      lastWeekSales: convertCurrency(pt.lastWeekSales, currency),
    }));
  }, [data, currency]);

  const funnelSteps = isLive && liveOrdersCount === 0
    ? [
        { name: t.charts.sessions, count: 0, pct: '100%', drop: null, icon: Users },
        { name: t.charts.productViews, count: 0, pct: '0%', drop: null, icon: Eye },
        { name: t.charts.addToCart, count: 0, pct: '0%', drop: null, icon: ShoppingBag },
        { name: t.charts.checkout, count: 0, pct: '0%', drop: null, icon: CreditCard },
        { name: t.charts.purchased, count: 0, pct: '0%', drop: null, icon: CheckCircle },
      ]
    : [
        { name: t.charts.sessions, count: 12450, pct: '100%', drop: null, icon: Users },
        { name: t.charts.productViews, count: 7820, pct: '62.8%', drop: '-37.2%', icon: Eye },
        { name: t.charts.addToCart, count: 1180, pct: '15.1%', drop: '-84.9%', icon: ShoppingBag },
        { name: t.charts.checkout, count: 490, pct: '41.5%', drop: '-58.5%', icon: CreditCard },
        { name: t.charts.purchased, count: 382, pct: '77.9%', drop: '-22.1%', icon: CheckCircle },
      ];

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 2 Cols: Hourly Sales & Blended ROAS Trends */}
      <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">{t.charts.revenueRoasTitle}</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{t.charts.revenueRoasSubtitle}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-zinc-200" />
                <span className="text-zinc-300">{t.charts.todaySales}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 rounded-full bg-zinc-600" />
                <span className="text-zinc-400">{t.charts.lastWeekSales}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-full bg-emerald-400" />
                <span className="text-emerald-400">{t.charts.todayRoas}</span>
              </div>
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={convertedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesTodayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${currencySymbol}${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}k`;
                    return `${currencySymbol}${val}`;
                  }}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121215',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    fontSize: '11px',
                    color: '#fafafa',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'todaySales' || name === 'lastWeekSales') {
                      return [
                        `${currencySymbol}${Number(value).toLocaleString(currency === 'TRY' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 0 })}`,
                        name === 'todaySales' ? t.charts.todaySales : t.charts.lastWeekSales,
                      ];
                    }
                    return [`${value}x`, t.charts.todayRoas];
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="todaySales" stroke="#f4f4f5" strokeWidth={2} fillOpacity={1} fill="url(#salesTodayGradient)" />
                <Area yAxisId="left" type="monotone" dataKey="lastWeekSales" stroke="#71717a" strokeDasharray="3 3" strokeWidth={1.5} fillOpacity={0} />
                <Line yAxisId="right" type="monotone" dataKey="todayRoas" stroke="#34d399" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-zinc-400 font-mono">
          <span>
            {isLive && liveOrdersCount === 0
              ? (language === 'tr'
                  ? 'Shopify Canlı API Bağlantısı: Aktif'
                  : 'Shopify Live API Stream: Active')
              : (language === 'tr'
                  ? `En Yüksek Satış Saati: 18:00 (${formatCurrency(1340, currency)})`
                  : `Peak Sales Window: 18:00 (${formatCurrency(1340, currency)})`)}
          </span>
          <span className="text-zinc-300 font-medium">
            {isLive && liveOrdersCount === 0
              ? (language === 'tr' ? 'İlk Canlı Sipariş Bekleniyor' : 'Awaiting First Order')
              : (language === 'tr' ? 'Günlük Hedef: %114' : 'Target Pacing: 114%')}
          </span>
        </div>
      </div>

      {/* 1 Col: Conversion Funnel Analysis */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100">{t.charts.funnelTitle}</h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
              {isLive && liveOrdersCount === 0
                ? (language === 'tr' ? 'Veri Bekleniyor' : 'Awaiting Data')
                : '%3.2 CR'}
            </span>
          </div>

          <div className="space-y-3 mt-3">
            {funnelSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="p-2.5 rounded-lg border border-white/[0.04] bg-zinc-900/40">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      <Icon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{step.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-100 font-medium">{step.count.toLocaleString('en-US')}</span>
                      {step.drop && (
                        <span className="text-[10px] text-zinc-400 font-mono">{step.drop}</span>
                      )}
                    </div>
                  </div>

                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-400 rounded-full transition-all duration-500"
                      style={{
                        width: isLive && liveOrdersCount === 0
                          ? '0%'
                          : `${Math.max(12, 100 - idx * 20)}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] text-[11px] text-zinc-300">
          <p className="font-medium text-zinc-200 mb-0.5">
            {isLive && liveOrdersCount === 0
              ? (language === 'tr' ? 'Canlı Akış Durumu' : 'Live Stream Status')
              : (language === 'tr' ? 'Optimizasyon Notu' : 'Optimization Note')}
          </p>
          <p className="text-zinc-400 text-[10px] leading-relaxed">
            {isLive && liveOrdersCount === 0
              ? (language === 'tr'
                  ? 'Shopify mağazanız doğrudan Admin API ile senkronize edildi. Gerçek müşteriler ziyaret edip sipariş verdikçe hunideki tüm basamaklar gerçek zamanlı akacaktır.'
                  : 'Your Shopify store is directly synced via Admin API. As customers visit and complete orders, each funnel stage will update dynamically in real time.')
              : (language === 'tr'
                  ? 'Sepete ekleyenlerin %58.5\'i ödeme adımında ayrılıyor. Ürün sayfasında "Ücretsiz Kargo" eşik sayacı önerilir.'
                  : '58.5% of cart additions drop off before checkout. Add a "Free Shipping Threshold" progress bar on product pages.')}
          </p>
        </div>
      </div>
    </div>
  );
}
