'use client';

import React, { useState } from 'react';
import { Product, ProductStatus, Language, Currency } from '@/types';
import { translations } from '@/lib/i18n/translations';
import { formatCurrency } from '@/lib/currency';
import {
  Search,
  Sparkles,
  AlertCircle,
  Package,
} from 'lucide-react';
import Image from 'next/image';

interface ProductsTableProps {
  products: Product[];
  filterStatus: ProductStatus | 'ALL';
  language: Language;
  currency?: Currency;
  onOpenContentModal: (product: Product) => void;
}

export default function ProductsTable({
  products,
  filterStatus,
  language,
  currency = 'USD',
  onOpenContentModal,
}: ProductsTableProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'STAR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-medium">
            Star
          </span>
        );
      case 'QUESTION_MARK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10 text-[10px] font-mono font-medium">
            Opportunity
          </span>
        );
      case 'CASH_COW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
            Cash Cow
          </span>
        );
      case 'ZOMBIE_DOG':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-medium">
            Zombie
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121215] shadow-sm overflow-hidden">
      {/* Table Header & Search */}
      <div className="p-5 sm:p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">{t.productsTable.title}</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {filteredProducts.length} {language === 'tr' ? 'ürün listeleniyor' : 'products found'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.productsTable.searchPlaceholder}
            className="w-full bg-zinc-900/90 border border-white/[0.08] hover:border-white/[0.14] focus:border-white/25 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-400 focus:outline-none transition-colors font-mono"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/30 border-b border-white/[0.06] text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">{t.productsTable.colProduct}</th>
              <th className="py-3 px-4">{t.productsTable.colStatus}</th>
              <th className="py-3 px-4">{t.productsTable.colScore}</th>
              <th className="py-3 px-4">{t.productsTable.colPriceMargin}</th>
              <th className="py-3 px-4">{t.productsTable.colInventory}</th>
              <th className="py-3 px-4">{t.productsTable.colVelocity}</th>
              <th className="py-3 px-5 text-right">{t.productsTable.colAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-zinc-850/40 transition-colors group"
              >
                {/* Product Info */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-850 border border-white/[0.08] shrink-0">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-100 group-hover:text-white transition-colors">
                        {product.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 font-mono">
                        <span>{product.sku}</span>
                        <span>•</span>
                        <span>{product.category}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* BCG Status */}
                <td className="py-3.5 px-4">{getStatusBadge(product.status)}</td>

                {/* Score */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md border font-mono font-medium text-xs ${getScoreColor(
                      product.score
                    )}`}
                  >
                    {product.score}
                  </span>
                </td>

                {/* Price & Margin */}
                <td className="py-3.5 px-4 font-mono">
                  <div className="font-medium text-zinc-100">{formatCurrency(product.retailPrice, currency)}</div>
                  <div className="text-[10px] text-emerald-400">
                    %{product.grossMarginPct.toFixed(1)} marj
                  </div>
                </td>

                {/* Inventory & Days Left */}
                <td className="py-3.5 px-4 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-200">{product.inventory}</span>
                    <span className="text-zinc-400">{language === 'tr' ? 'adet' : 'units'}</span>
                  </div>
                  <div className="text-[10px] flex items-center gap-1 mt-0.5">
                    {!product.velocity30Days || product.velocity30Days === 0 ? (
                      <span className="text-zinc-500 italic text-[10px]">
                        {language === 'tr' ? 'Satış verisi bekleniyor' : 'Awaiting sales velocity'}
                      </span>
                    ) : product.daysOfInventory <= 5 ? (
                      <span className="text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {product.daysOfInventory} {t.productsTable.daysLeft}
                      </span>
                    ) : (
                      <span className="text-zinc-400">
                        {product.daysOfInventory} {t.productsTable.daysLeft}
                      </span>
                    )}
                  </div>
                </td>

                {/* Velocity & CR */}
                <td className="py-3.5 px-4 font-mono">
                  {(!product.velocity30Days || product.velocity30Days === 0) && (!product.conversionRate || product.conversionRate === 0) ? (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 border border-white/[0.06] text-[10px] text-zinc-400 font-sans italic">
                      {language === 'tr' ? 'Veri Bekleniyor (Henüz Sipariş Yok)' : 'Awaiting Data (No Orders Yet)'}
                    </div>
                  ) : (
                    <>
                      <div className="text-zinc-200">
                        {product.velocity30Days || 0} <span className="text-zinc-400 text-[10px]">{language === 'tr' ? '/gün' : '/day'}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        %{product.conversionRate || 0} CR
                      </div>
                    </>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => onOpenContentModal(product)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/20 bg-transparent hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-zinc-400" />
                    <span>{t.productsTable.optimizeContent}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
