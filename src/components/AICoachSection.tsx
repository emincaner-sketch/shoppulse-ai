'use client';

import React, { useState } from 'react';
import { ActionCard, Language } from '@/types';
import { translations } from '@/lib/i18n/translations';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Bot,
  Send,
  X,
  Tag,
  Package,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface AICoachSectionProps {
  cards: ActionCard[];
  language: Language;
  onApplyAction: (actionId: string) => void;
  onDismissAction: (actionId: string) => void;
  onOpenContentModal: (productId: string) => void;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
}

function getSafeText(field: any, lang: Language, fallback = ''): string {
  if (!field) return fallback;
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    return field[lang] || field.tr || field.en || fallback;
  }
  return String(field);
}

export default function AICoachSection({
  cards,
  language,
  onApplyAction,
  onReanalyze,
  isReanalyzing = false,
}: AICoachSectionProps) {
  const t = translations[language];
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text:
        language === 'tr'
          ? 'Merhaba! Ben ShopPulse AI Satış Koçunuz. Mağazanızın son 90 günlük sipariş, stok ve rakip verilerini analiz ettim. Bugün hangi konuyu optimize etmek istersiniz?'
          : 'Hello! I am your ShopPulse AI Growth Copilot. I have analyzed your Shopify orders, stock velocity, and competitor moves. What would you like to optimize today?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleApplyClick = (card: ActionCard) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#10b981', '#71717a'],
      });
    } catch {}
    onApplyAction(card.id);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user' as const, text: textToSend }];
    setChatMessages(newMsgs);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, language }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setChatMessages([...newMsgs, { role: 'assistant', text: data.reply }]);
          setIsTyping(false);
          return;
        }
      }
    } catch (e) {
      console.warn('API error, falling back to local heuristic:', e);
    }

    setTimeout(() => {
      let reply = '';
      if (textToSend.includes('dönüşüm') || textToSend.toLowerCase().includes('conversion') || textToSend.includes('satış') || textToSend.includes('order')) {
        reply =
          language === 'tr'
            ? 'Nightfold DeepRest 3D Uyku Maskesi şu an canlı katalogda 36.714 adet stokla hazır bekliyor ancak henüz 0 sipariş kaydedilmiş. Temel tıkanıklık: Soğuk trafik hunisinde kanca (hook) eksikliği. TikTok ve Instagram Reels için "100% Karartma (Zero Light Leak)" temalı 3 saniyelik kreatif kancalar ve sepette "2. Ürüne %40 İndirim" uyku seti teklifi sunmalıyız.'
            : 'Nightfold DeepRest 3D Sleep Mask is stocked with 36,714 units ready, but currently records 0 sales. The primary bottleneck is top-of-funnel ad hook resonance. We recommend launching 3-second TikTok hooks highlighting 100% Blackout / Zero Eye Pressure and introducing a "Buy 1, Get 2nd 40% Off" couples bundle.';
      } else if (textToSend.includes('rakip') || textToSend.toLowerCase().includes('competitor') || textToSend.includes('manta')) {
        reply =
          language === 'tr'
            ? 'Pazar lideri Manta Sleep PRO şu anda $39.99 seviyesinde fiyatlandırılmış durumda. Nightfold $34.99 liste fiyatıyla tam $5.00 net fiyat avantajına ve 3D derin göz oyukları (sıfır göz baskısı) ergonomisine sahip. Reklam kopyalarımızda bu $5 arbitrajı ve ergonomiyi vurgulamalıyız.'
            : 'Key market benchmark Manta Sleep PRO is currently selling at $39.99. Nightfold at $34.99 commands a $5.00 immediate price arbitrage advantage plus zero-pressure 3D contoured eye cups. We should directly feature this value proposition in ad copy A/B tests.';
      } else {
        reply =
          language === 'tr'
            ? 'Nightfold Büyüme Direktörü Özeti: 36.714 adet stok ($1.28M potansiyel envanter değeri) aktif. İlk satış ivmesi için Meta Ads veya TikTok UGC kreatif testini başlatıp $34.99 tekli + $49.99 çiftli uyku seti paketini ana sayfada öne çıkaralım.'
            : 'Nightfold Growth Director Summary: 36,714 units ($1.28M inventory pipeline) ready. To kickstart initial sales velocity, launch UGC ad creative testing on Meta/TikTok and feature a $49.99 Couples Sleep Bundle on the storefront hero.';
      }

      setChatMessages([...newMsgs, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border border-white/[0.08]';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INVENTORY':
        return <Package className="w-3.5 h-3.5 text-zinc-300" />;
      case 'PRICING':
        return <Tag className="w-3.5 h-3.5 text-zinc-300" />;
      case 'BUNDLE':
        return <Layers className="w-3.5 h-3.5 text-zinc-300" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-zinc-300" />;
    }
  };

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800 border border-white/[0.08] text-[10px] font-mono uppercase text-zinc-300">
              <Bot className="w-3 h-3 text-zinc-400" />
              {t.aiCoach.badge}
            </span>
            <span className="text-[11px] text-purple-400 font-mono font-medium">Gemini 1.5 Pro & Flash (Growth Director)</span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight">{t.aiCoach.title}</h2>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">{t.aiCoach.subtitle}</p>
        </div>

        {/* Action Buttons: Re-analyze with Gemini & Open Assistant */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onReanalyze && (
            <button
              onClick={onReanalyze}
              disabled={isReanalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isReanalyzing ? 'animate-spin' : ''}`} />
              <span>
                {isReanalyzing
                  ? (language === 'tr' ? 'Analiz Ediliyor...' : 'Analyzing...')
                  : (language === 'tr' ? 'Yeniden Analiz Et (Gemini)' : 'Re-analyze (Gemini)')}
              </span>
            </button>
          )}
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/20 bg-transparent text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t.aiCoach.openAssistant}</span>
          </button>
        </div>
      </div>

      {/* 3 Priority Action Cards with Visual Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {cards.map((card) => {
          const isApplied = card.status === 'APPLIED';
          const isCritical = card.priority === 'CRITICAL';
          const isHigh = card.priority === 'HIGH';

          // Visual Hierarchy: Critical gets thin red accent line and subtle red tint border
          const cardBorderStyle = isApplied
            ? 'border-emerald-500/20 bg-emerald-950/10'
            : isCritical
            ? 'border-l-2 border-l-rose-500 border-rose-500/30 bg-rose-950/[0.08] shadow-sm'
            : isHigh
            ? 'border-l-2 border-l-amber-500/80 border-white/[0.08] bg-zinc-900/40 hover:border-white/[0.14]'
            : 'border-white/[0.08] bg-zinc-900/40 hover:border-white/[0.14]';

          return (
            <div
              key={card.id}
              className={`flex flex-col justify-between rounded-xl p-5 transition-colors ${cardBorderStyle}`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                    {getCategoryIcon(card.category)}
                    <span>{card.category}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${getPriorityBadge(
                      card.priority
                    )}`}
                  >
                    {card.priority}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 leading-snug mb-2">
                  {getSafeText(card.title, language, language === 'tr' ? 'Büyüme Fırsatı' : 'Growth Opportunity')}
                </h3>

                {/* Description - readable text-zinc-300 */}
                <p className="text-xs text-zinc-300/90 leading-relaxed mb-3">
                  {getSafeText(card.description, language, '')}
                </p>

                {/* Rationale box with horizontal divider border-t */}
                <div className="border-t border-white/[0.08] pt-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{t.aiCoach.rationale}:</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {getSafeText(card.rationale || (card as any).reasoning, language, '')}
                  </p>
                </div>
              </div>

              {/* Impact & Action button */}
              <div className="border-t border-white/[0.08] pt-3 mt-3">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-zinc-400 font-medium">{t.aiCoach.impact}:</span>
                  <span className="font-mono text-emerald-400 font-semibold text-xs">
                    {getSafeText(card.impactEstimate || (card as any).impact, language, '+%15')}
                  </span>
                </div>

                {isApplied ? (
                  <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.aiCoach.applied}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApplyClick(card)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-medium transition-colors active:scale-95 shadow-sm"
                  >
                    <span>
                      {getSafeText(
                        card.suggestedActionText,
                        language,
                        language === 'tr' ? 'Aksiyonu Uygula' : 'Apply Action'
                      )}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-900" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive AI Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#121215] shadow-2xl overflow-hidden flex flex-col h-[540px]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-zinc-400" />
                <div>
                  <h3 className="text-xs font-medium text-zinc-200">{t.aiCoach.assistantTitle}</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">Neural Model v2.4</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-5 py-2 bg-zinc-950/40 border-b border-white/[0.04] flex gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() =>
                  handleSendMessage(
                    language === 'tr'
                      ? 'Dönüşüm oranımı nasıl artırabilirim?'
                      : 'How can I lift my store conversion rate?'
                  )
                }
                className="whitespace-nowrap px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-white/[0.06] hover:bg-zinc-850"
              >
                {language === 'tr' ? 'Dönüşüm Tüyoları' : 'Conversion Tips'}
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    language === 'tr'
                      ? 'Rakip ZaraStyle fiyat hareketlerini açıkla'
                      : 'Explain competitor ZaraStyle moves'
                  )
                }
                className="whitespace-nowrap px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-white/[0.06] hover:bg-zinc-850"
              >
                {language === 'tr' ? 'Rakip Analizi' : 'Competitor Move'}
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-zinc-800 text-zinc-100 font-medium'
                        : 'bg-zinc-900/80 text-zinc-200 border border-white/[0.06]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono py-2">
                  <span>AI yanıtlıyor...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-white/[0.06] bg-zinc-950/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t.aiCoach.assistantPlaceholder}
                  className="flex-1 bg-zinc-900 border border-white/[0.08] focus:border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-3 py-2 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 disabled:opacity-40 text-xs font-medium transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
