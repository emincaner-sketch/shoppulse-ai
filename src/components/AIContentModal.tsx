'use client';

import React, { useState } from 'react';
import { Product, Language } from '@/types';
import { translations } from '@/lib/i18n/translations';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import Image from 'next/image';

interface AIContentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onApplyOptimization: (productId: string, newTitle: string, newDesc: string) => void;
}

export default function AIContentModal({
  product,
  isOpen,
  onClose,
  language,
  onApplyOptimization,
}: AIContentModalProps) {
  const t = translations[language];
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const optimizedTitle =
    product.aiOptimizedTitle ||
    `Premium ${product.title} | Nefes Alabilen Lüks Tasarım & Hızlı Kargo`;
  const optimizedDesc =
    product.aiOptimizedDesc ||
    `Bu ürün yüksek kaliteli işçilikle üretilmiş olup maksimum konfor ve şıklık sunar. Sosyal kanıt ve SEO anahtar kelimeleriyle optimize edilmiştir.`;

  const handleApply = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#10b981', '#71717a'],
        });
      } catch {}
      onApplyOptimization(product.id, optimizedTitle, optimizedDesc);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${optimizedTitle}\n\n${optimizedDesc}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#121215] shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-md text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-lg bg-zinc-850 border border-white/[0.08] text-zinc-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{t.aiModal.title}</h3>
            <p className="text-xs text-zinc-400">{t.aiModal.desc}</p>
          </div>
        </div>

        {/* Product Card Summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] my-4">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-zinc-850 shrink-0 border border-white/[0.06]">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-100">{product.title}</div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 font-mono">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span className="text-zinc-200">${product.retailPrice}</span>
              <span>•</span>
              <span className="text-emerald-400">Mevcut CR: %{product.conversionRate}</span>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="space-y-3.5 my-4">
          {/* Title Comparison */}
          <div>
            <span className="block text-xs font-medium text-zinc-300 mb-1.5">
              {t.aiModal.titleLabel}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/[0.06]">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  {t.aiModal.original}
                </span>
                <p className="text-zinc-400">{product.title}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-850 border border-white/[0.12]">
                <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider block mb-1">
                  {t.aiModal.suggested}
                </span>
                <p className="text-white font-medium">{optimizedTitle}</p>
              </div>
            </div>
          </div>

          {/* Description Comparison */}
          <div>
            <span className="block text-xs font-medium text-zinc-300 mb-1.5">
              {t.aiModal.descLabel}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/[0.06]">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  {t.aiModal.original}
                </span>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Standart ürün açıklaması. Arama motorları ve dönüşüm tetikleyicileri eksik.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-850 border border-white/[0.12]">
                <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider block mb-1">
                  {t.aiModal.suggested}
                </span>
                <p className="text-zinc-200 leading-relaxed text-[11px]">{optimizedDesc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Lift Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-xs my-4 font-mono">
          <div className="flex items-center gap-2 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{t.aiModal.expectedLift}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-medium transition-colors"
          >
            İptal
          </button>

          {isSuccess ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.aiModal.success}</span>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-medium transition-colors disabled:opacity-40"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                  <span>{t.aiModal.updating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                  <span>{t.aiModal.applyToShopify}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
