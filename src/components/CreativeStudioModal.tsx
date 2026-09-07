'use client';

import React, { useState, useEffect } from 'react';
import { Language } from '@/types';
import { translations } from '@/lib/i18n/translations';
import {
  X,
  Sparkles,
  Video,
  FileText,
  Camera,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Eye,
  Volume2,
  Share2,
  ExternalLink,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreativeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  productTitle?: string;
  price?: number;
}

type StudioTab = 'HOOKS' | 'META_ADS' | 'INSTAGRAM_BIO';

export default function CreativeStudioModal({
  isOpen,
  onClose,
  language,
  productTitle,
  price,
}: CreativeStudioModalProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<StudioTab>('HOOKS');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [studioData, setStudioData] = useState<any>(null);

  // Load initial creative package
  useEffect(() => {
    if (!isOpen) return;

    async function fetchCreatives() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ai/creative-studio?lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          setStudioData(data);
        }
      } catch (e) {
        console.warn('Creative studio fetch failed:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchCreatives();
  }, [isOpen, language]);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/creative-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      if (res.ok) {
        const data = await res.json();
        setStudioData(data);
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#10b981', '#ffffff'],
          });
        } catch {}
      }
    } catch (e) {
      console.warn('Regenerate failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/[0.1] bg-[#101014] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  {language === 'tr' ? 'AI Reklam & İçerik Stüdyosu' : 'AI Ad & Creative Studio'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {studioData?.isLiveAi ? 'Gemini 2.5 Canlı' : 'Gemini AI Modeli'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'tr'
                  ? 'Nightfold DeepRest 3D Uyku Maskesi için yüksek dönüşümlü video kancaları, reklam metinleri ve profil şablonları'
                  : 'High-converting viral hooks, ad copies, and profile setups for Nightfold DeepRest 3D Sleep Mask'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] hover:border-white/20 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{language === 'tr' ? 'Yeniden Üret' : 'Regenerate'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/[0.06] bg-zinc-900/20">
          <button
            onClick={() => setActiveTab('HOOKS')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'HOOKS'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{language === 'tr' ? 'TikTok & Reels Kancaları (0-3s)' : 'Viral Video Hooks (0-3s)'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded bg-white/[0.06] text-[10px] font-mono">
              {studioData?.viralHooks?.length || 5}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('META_ADS')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'META_ADS'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'tr' ? 'Meta Reklam Metinleri (A/B Test)' : 'Meta Ad Copy Variants'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded bg-white/[0.06] text-[10px] font-mono">
              {studioData?.adCopies?.length || 3}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('INSTAGRAM_BIO')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'INSTAGRAM_BIO'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{language === 'tr' ? 'Instagram Bio & Öne Çıkanlar' : 'Instagram Bio & Highlights'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: TikTok & Reels Viral Hooks */}
          {activeTab === 'HOOKS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <p>
                  {language === 'tr'
                    ? 'İlk 3 saniyede kullanıcıyı durduran (stop-scroll) psikolojik tetikleyiciler ve çekim talimatları:'
                    : 'Stop-scroll psychological hooks and filming directions designed for viral TikTok/Reels pacing:'}
                </p>
                <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {language === 'tr' ? 'Yüksek İzlenme Potansiyeli' : 'High Viral Potential'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(studioData?.viralHooks || []).map((hook: any, idx: number) => {
                  const scriptText = hook.script?.[language] || hook.script?.tr || hook.script?.en || '';
                  const visualText = hook.visualDirection?.[language] || hook.visualDirection?.tr || '';
                  return (
                    <div
                      key={hook.id || idx}
                      className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4 flex flex-col justify-between hover:border-white/[0.16] transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-zinc-200">{hook.title}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                            {hook.hookSeconds || '0-3 sn'}
                          </span>
                        </div>

                        {/* Script box */}
                        <div className="p-3 rounded-lg bg-zinc-950/70 border border-white/[0.04]">
                          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                            {language === 'tr' ? 'Konuşma / Ses Metni (Script):' : 'Spoken Voiceover / Hook:'}
                          </div>
                          <p className="text-xs text-zinc-200 leading-relaxed font-medium italic">
                            {scriptText}
                          </p>
                        </div>

                        {/* Visual & Audio Directions */}
                        <div className="space-y-1.5 text-[11px] text-zinc-400">
                          <div className="flex items-start gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <span>
                              <b className="text-zinc-300">{language === 'tr' ? 'Görsel Çekim:' : 'Visual:'}</b>{' '}
                              {visualText}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>
                              <b className="text-zinc-300">{language === 'tr' ? 'Ses:' : 'Audio:'}</b>{' '}
                              {hook.audioCue}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {hook.targetPainPoint}
                        </span>
                        <button
                          onClick={() => copyToClipboard(scriptText, `hook-${idx}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 transition-colors"
                        >
                          {copiedId === `hook-${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">{language === 'tr' ? 'Kopyalandı' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>{language === 'tr' ? 'Senaryoyu Kopyala' : 'Copy Script'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Meta Ads Copy Variants */}
          {activeTab === 'META_ADS' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                {language === 'tr'
                  ? 'Meta Ads Manager Advantage+ kampanyalarınızda doğrudan A/B testi yapabileceğiniz birincil metin ve başlıklar:'
                  : 'Ready-to-deploy Meta Advantage+ primary texts and headlines structured for rapid A/B testing:'}
              </div>

              <div className="space-y-4">
                {(studioData?.adCopies || []).map((copy: any, idx: number) => {
                  const angleName = copy.angleName?.[language] || copy.angleName?.tr || copy.angleName?.en || `Açı #${idx + 1}`;
                  const primaryText = copy.primaryText?.[language] || copy.primaryText?.tr || copy.primaryText?.en || '';
                  const headline = copy.headline?.[language] || copy.headline?.tr || copy.headline?.en || '';
                  const description = copy.description?.[language] || copy.description?.tr || copy.description?.en || '';

                  return (
                    <div
                      key={copy.id || idx}
                      className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-5 space-y-4 hover:border-white/[0.16] transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold font-mono">
                            VARYASYON {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-xs font-medium text-zinc-200">{angleName}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${primaryText}\n\nBaşlık: ${headline}`, `copy-${idx}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
                        >
                          {copiedId === `copy-${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">{language === 'tr' ? 'Kopyalandı' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{language === 'tr' ? 'Metni Kopyala' : 'Copy All'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                            {language === 'tr' ? 'Birincil Reklam Metni (Primary Text):' : 'Primary Text:'}
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-950/70 border border-white/[0.04] text-zinc-300 whitespace-pre-line leading-relaxed">
                            {primaryText}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                              {language === 'tr' ? 'Başlık (Headline):' : 'Headline:'}
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-white/[0.04] text-zinc-200 font-semibold">
                              {headline}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                              {language === 'tr' ? 'Açıklama (Description) & Buton:' : 'Description & CTA:'}
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-white/[0.04] text-zinc-400 flex items-center justify-between">
                              <span className="truncate mr-2">{description}</span>
                              <span className="px-2 py-0.5 rounded bg-white text-zinc-950 font-medium text-[10px] shrink-0 font-mono">
                                {copy.callToAction || 'Shop Now'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Instagram Bio & Highlights */}
          {activeTab === 'INSTAGRAM_BIO' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-zinc-200 mb-1">
                  {language === 'tr' ? 'Dönüşüm Odaklı Instagram Biyografileri' : 'High-Converting Instagram Bios'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {language === 'tr'
                    ? 'Profilinizi ziyaret eden soğuk reklam trafiğini doğrudan ürün detay sayfasına yönlendiren bio metinleri:'
                    : 'Bio options engineered to funnel cold social traffic directly into product page checkouts:'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  {(studioData?.instagramBio?.bioOptions || []).map((bio: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-white/[0.08] bg-zinc-900/40 flex flex-col justify-between hover:border-white/[0.16] transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-emerald-400">{bio.title}</span>
                          <button
                            onClick={() => copyToClipboard(bio.bioText, `bio-${idx}`)}
                            className="p-1 rounded text-zinc-400 hover:text-white"
                          >
                            {copiedId === `bio-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-white/[0.04]">
                          {bio.bioText}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>{bio.ctaLink}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-zinc-200 mb-1">
                  {language === 'tr' ? 'Öne Çıkan Hikaye (Story Highlights) Mimarisi' : 'Story Highlights Architecture'}
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  {language === 'tr'
                    ? 'Instagram profilinizde güven oluşturan ve dönüşümü destekleyen 4 temel sabit hikaye:'
                    : '4 fundamental fixed highlight circles to build instant brand trust and social proof:'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(studioData?.instagramBio?.storyHighlights || []).map((hl: any, idx: number) => {
                    const conceptText = hl.concept?.[language] || hl.concept?.tr || hl.concept?.en || '';
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-white/[0.06] bg-zinc-900/30 text-center space-y-2"
                      >
                        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 border-2 border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
                          {hl.icon}
                        </div>
                        <div className="font-semibold text-xs text-zinc-200">{hl.title}</div>
                        <p className="text-[10px] text-zinc-400 leading-snug">{conceptText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-zinc-900/40 text-xs">
          <span className="text-zinc-400 font-mono text-[11px]">
            {language === 'tr' ? 'Nightfold 3D Uyku Maskesi Kataloğuna Özel' : 'Tailored to Nightfold 3D Sleep Mask'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors"
          >
            {language === 'tr' ? 'Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
