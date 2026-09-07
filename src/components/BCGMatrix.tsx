'use client';

import React from 'react';
import { Product, ProductStatus, Language } from '@/types';
import { translations } from '@/lib/i18n/translations';
import { Star, HelpCircle, Flame, Skull, Layers, ArrowUpRight } from 'lucide-react';

interface BCGMatrixProps {
  products: Product[];
  selectedStatus: ProductStatus | 'ALL';
  onSelectStatus: (status: ProductStatus | 'ALL') => void;
  language: Language;
}

export default function BCGMatrix({
  products,
  selectedStatus,
  onSelectStatus,
  language,
}: BCGMatrixProps) {
  const t = translations[language];

  const counts = {
    STAR: products.filter((p) => p.status === 'STAR').length,
    QUESTION_MARK: products.filter((p) => p.status === 'QUESTION_MARK').length,
    CASH_COW: products.filter((p) => p.status === 'CASH_COW').length,
    ZOMBIE_DOG: products.filter((p) => p.status === 'ZOMBIE_DOG').length,
  };

  const quadrants = [
    {
      status: 'STAR' as ProductStatus,
      title: t.bcg.stars,
      desc: t.bcg.starsDesc,
      count: counts.STAR,
      icon: Star,
      badge: language === 'tr' ? '%52 Ciro Payı' : '52% Share',
      color: 'text-amber-400',
    },
    {
      status: 'QUESTION_MARK' as ProductStatus,
      title: t.bcg.questionMarks,
      desc: t.bcg.questionMarksDesc,
      count: counts.QUESTION_MARK,
      icon: HelpCircle,
      badge: language === 'tr' ? '%18 Trafik' : '18% Traffic',
      color: 'text-zinc-300',
    },
    {
      status: 'CASH_COW' as ProductStatus,
      title: t.bcg.cashCows,
      desc: t.bcg.cashCowsDesc,
      count: counts.CASH_COW,
      icon: Flame,
      badge: language === 'tr' ? 'Nakit Akışı' : 'Cashflow',
      color: 'text-emerald-400',
    },
    {
      status: 'ZOMBIE_DOG' as ProductStatus,
      title: t.bcg.zombies,
      desc: t.bcg.zombiesDesc,
      count: counts.ZOMBIE_DOG,
      icon: Skull,
      badge: language === 'tr' ? '$1,400 Bağlı' : '$1,400 Locked',
      color: 'text-rose-400',
    },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">{t.bcg.title}</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">{t.bcg.subtitle}</p>
        </div>

        <button
          onClick={() => onSelectStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedStatus === 'ALL'
              ? 'bg-zinc-800 text-zinc-100 border border-white/10'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-transparent'
          }`}
        >
          {t.bcg.filterAll} ({products.length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {quadrants.map((quad) => {
          const Icon = quad.icon;
          const isSelected = selectedStatus === quad.status;
          return (
            <div
              key={quad.status}
              onClick={() => onSelectStatus(isSelected ? 'ALL' : quad.status)}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-white/25 bg-zinc-850/70'
                  : 'border-white/[0.06] bg-zinc-900/40 hover:border-white/[0.12] hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-1.5 rounded-md bg-zinc-850 border border-white/[0.06] text-zinc-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-mono font-medium text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-850">
                  {quad.count} SKU
                </span>
              </div>

              <h4 className="text-xs font-medium text-zinc-100 mb-1 flex items-center justify-between">
                <span>{quad.title}</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-400" />
              </h4>

              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                {quad.desc}
              </p>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400">Etki</span>
                <span className={`font-medium ${quad.color}`}>{quad.badge}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
