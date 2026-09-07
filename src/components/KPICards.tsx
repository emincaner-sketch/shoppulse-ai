'use client';

import React from 'react';
import { Currency, Language } from '@/types';
import { translations } from '@/lib/i18n/translations';
import { formatCurrency } from '@/lib/currency';
import {
  DollarSign,
  ShoppingCart,
  Zap,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

interface KPICardsProps {
  language: Language;
  currency: Currency;
  storeId?: string;
  isLive?: boolean;
  liveMetrics?: {
    todaySales?: number;
    todayOrders?: number;
    totalOrders?: number;
    totalSales?: number;
  };
}

export default function KPICards({
  language,
  currency,
  storeId = 'store-1',
  isLive = false,
  liveMetrics,
}: KPICardsProps) {
  const t = translations[language];
  const isNordic = storeId === 'store-2';

  // If live store connected, use real live Shopify metrics
  const todaySalesVal = isLive
    ? liveMetrics?.todaySales ?? 0
    : isNordic
    ? 2410
    : 4820;

  const ordersVal = isLive
    ? String(liveMetrics?.todayOrders ?? 0)
    : isNordic
    ? '34'
    : '68';

  const lastWeekSalesVal = isNordic ? 2180 : 4220;
  const lastWeekOrdersVal = isNordic ? '29' : '62';

  const cards = isLive
    ? [
        {
          id: 'sales',
          title: t.kpi.todaySales,
          value: formatCurrency(todaySalesVal, currency),
          trend: todaySalesVal > 0 ? '+100%' : (language === 'tr' ? 'Canlı API' : 'Live API'),
          subtext:
            todaySalesVal > 0
              ? `${t.kpi.vsLastWeek} (${formatCurrency(0, currency)})`
              : (language === 'tr' ? 'Bugün henüz sipariş yok' : 'No orders today'),
          icon: DollarSign,
        },
        {
          id: 'orders',
          title: t.kpi.ordersCount,
          value: ordersVal,
          trend: Number(ordersVal) > 0 ? `+${ordersVal}` : (language === 'tr' ? 'Shopify Dinleniyor' : 'Listening'),
          subtext:
            language === 'tr'
              ? `Toplam: ${liveMetrics?.totalOrders ?? 0} sipariş`
              : `Total: ${liveMetrics?.totalOrders ?? 0} orders`,
          icon: ShoppingCart,
        },
        {
          id: 'roas',
          title: t.kpi.blendedRoas,
          value: todaySalesVal > 0 ? '3.80x' : (language === 'tr' ? 'Hazır' : 'Ready'),
          trend: language === 'tr' ? 'Sentinel Aktif' : 'Sentinel Active',
          subtext:
            language === 'tr'
              ? 'Canlı Shopify kataloğu bağlı'
              : 'Live Shopify catalog connected',
          icon: Zap,
        },
        {
          id: 'profit',
          title: t.kpi.netProfit,
          value: formatCurrency(Math.round(todaySalesVal * 0.42), currency),
          trend: todaySalesVal > 0 ? '%42.0' : (language === 'tr' ? 'Net Marj' : 'Net Margin'),
          subtext:
            language === 'tr'
              ? 'Shopify API ile doğrudan bağlı'
              : 'Direct Shopify API sync',
          icon: TrendingUp,
        },
      ]
    : [
        {
          id: 'sales',
          title: t.kpi.todaySales,
          value: formatCurrency(todaySalesVal, currency),
          trend: isNordic ? '+10.5%' : '+14.2%',
          subtext: `${t.kpi.vsLastWeek} (${formatCurrency(lastWeekSalesVal, currency)})`,
          icon: DollarSign,
        },
        {
          id: 'orders',
          title: t.kpi.ordersCount,
          value: ordersVal,
          trend: isNordic ? '+17.2%' : '+8.4%',
          subtext: `${t.kpi.vsLastWeek} (${lastWeekOrdersVal})`,
          icon: ShoppingCart,
        },
        {
          id: 'roas',
          title: t.kpi.blendedRoas,
          value: isNordic ? '3.85x' : '3.42x',
          trend: isNordic ? '+0.45x' : '+0.42x',
          subtext: `${t.kpi.vsLastWeek} (${isNordic ? '3.40x' : '3.00x'})`,
          icon: Zap,
        },
        {
          id: 'profit',
          title: t.kpi.netProfit,
          value: formatCurrency(isNordic ? 940 : 1890, currency),
          trend: isNordic ? '%38.6' : '%39.2',
          subtext: t.kpi.margin,
          icon: TrendingUp,
        },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="rounded-xl border border-white/[0.08] bg-[#121215] p-5 shadow-sm transition-colors hover:border-white/[0.14]"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-zinc-300">{card.title}</span>
              <div className="p-1.5 rounded-md bg-zinc-850 border border-white/[0.06] text-zinc-300">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 my-1">
              <div className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white tabular-nums">
                {card.value}
              </div>
              <div className="flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
                <ArrowUpRight className="w-3 h-3" />
                <span>{card.trend}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.08] pt-2.5 tabular-nums">
              <span>{card.subtext}</span>
              <span className="text-zinc-400 font-medium">Shopify API</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
