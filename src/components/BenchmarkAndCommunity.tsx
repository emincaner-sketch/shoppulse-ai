'use client';

import React, { useState } from 'react';
import { CategoryBenchmark, CommunityPost, Language, Currency } from '@/types';
import { translations } from '@/lib/i18n/translations';
import { formatCurrency } from '@/lib/currency';
import {
  BarChart3,
  MessageSquare,
  ThumbsUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Users,
  Gift,
  Copy,
  Check,
  X,
  Plus,
  Send,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BenchmarkAndCommunityProps {
  benchmarks: CategoryBenchmark[];
  posts: CommunityPost[];
  language: Language;
  currency?: Currency;
}

export default function BenchmarkAndCommunity({
  benchmarks,
  posts,
  language,
  currency = 'USD',
}: BenchmarkAndCommunityProps) {
  const t = translations[language];
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>(posts);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopiedReferral, setIsCopiedReferral] = useState(false);

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('DTC Uyku & Sağlık');
  const [postTags, setPostTags] = useState('Büyüme, ROAS, Taktik');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = (postId: string) => {
    const isLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setLocalPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p))
    );
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('https://shoppulse.ai/invite/nightfold-ref88');
    setIsCopiedReferral(true);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#a855f7', '#ffffff', '#10b981'],
    });
    setTimeout(() => setIsCopiedReferral(false), 2000);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          content: postContent.trim(),
          category: postCategory,
          authorName: language === 'tr' ? 'Lumina Fashion Kurucusu' : 'Founder at Lumina Fashion',
          authorBadge: language === 'tr' ? 'Doğrulanmış Satıcı' : 'Verified Merchant',
          tags: postTags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setLocalPosts([data.post, ...localPosts]);
        }
      } else {
        // Local fallback
        const fallbackPost: CommunityPost = {
          id: `post-${Date.now()}`,
          authorName: language === 'tr' ? 'Nightfold Sleep Kurucusu' : 'Founder at Nightfold Sleep',
          authorStoreCategory: postCategory,
          authorBadge: language === 'tr' ? 'Doğrulanmış Satıcı' : 'Verified Merchant',
          verifiedRevenue: '$48K+ / Ay',
          title: postTitle.trim(),
          content: postContent.trim(),
          likes: 1,
          commentsCount: 0,
          timeAgo: language === 'tr' ? 'Az önce' : 'Just now',
          tags: postTags.split(',').map((t) => t.trim()).filter(Boolean),
        };
        setLocalPosts([fallbackPost, ...localPosts]);
      }

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });

      setPostTitle('');
      setPostContent('');
      setIsShareModalOpen(false);
    } catch {
      setIsShareModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Effect & Referral Viral Loop Banner */}
      <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#121215] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-100">
                {language === 'tr'
                  ? 'ShopPulse Network Etkisi: 1 Ay Ücretsiz Pro Kazanın'
                  : 'ShopPulse Network Growth: Earn 1 Month Free Pro'}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                Viral Loop
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {language === 'tr'
                ? 'Başka bir Shopify mağaza sahibini davet edin; her iki taraf da 1 ay boyunca tüm AI Koç & Sentinel özelliklerini sınırsız kullansın.'
                : 'Invite another Shopify merchant; both of you unlock 1 month of unlimited AI Coach & Sentinel features.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyReferral}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-medium transition-colors shrink-0 self-start sm:self-center"
        >
          {isCopiedReferral ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'tr' ? 'Davet Linki Kopyalandı ✓' : 'Invite Link Copied ✓'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{language === 'tr' ? 'Özel Davet Linkini Kopyala' : 'Copy Merchant Referral Link'}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Benchmarks + Community Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1 Col: Anonymous Category Benchmarks (Minimalist Comparison Layout) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">{t.benchmarks.title}</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                DTC Mode
              </span>
            </div>

            <p className="text-xs text-zinc-400 mt-1 mb-5">
              {t.benchmarks.category}
            </p>

            <div className="space-y-4">
              {benchmarks.map((bench, idx) => {
                // Calculate percent difference vs industry
                const diffPct = ((bench.storeValue - bench.benchmarkValue) / bench.benchmarkValue) * 100;
                const isPositive = bench.isHigherBetter ? diffPct >= 0 : diffPct <= 0;
                const formattedDiff = `${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%`;

                const formatVal = (val: number) => {
                  if (bench.metric.includes('CR')) return `%${val}`;
                  if (bench.metric.includes('AOV') || bench.metric.includes('CAC')) {
                    return formatCurrency(val, currency, { maximumFractionDigits: 1 });
                  }
                  return `${val.toFixed(2)}x`;
                };

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/[0.06] bg-zinc-900/40 hover:border-white/[0.1] transition-colors"
                  >
                    {/* Top row: Metric Name & Subdued Percentile Pill */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-zinc-300">{bench.metric}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-medium">
                        Top %{100 - bench.percentileRank}
                      </span>
                    </div>

                    {/* Middle row: Big Metric + Clean Comparison Badge */}
                    <div className="flex items-baseline gap-2.5 my-1">
                      <span className="text-2xl font-mono font-medium text-white tracking-tight tabular-nums">
                        {formatVal(bench.storeValue)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-mono font-medium tabular-nums ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{formattedDiff} vs sektör</span>
                      </span>
                    </div>

                    {/* Bottom row: Minimalist Range Reference Baseline */}
                    <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Sektör Medyanı: {formatVal(bench.benchmarkValue)}</span>
                      <span className="text-zinc-400">
                        {isPositive ? 'Ortalamanın üzerinde' : 'Optimizasyon potansiyeli'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] text-zinc-400 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>420+ doğrulanmış anonim mağazanın 30 günlük verileri.</span>
          </div>
        </div>

        {/* 2 Cols: Verified Merchant Community Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#121215] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header & Ghost/Outline Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-sm font-semibold text-zinc-100">{t.benchmarks.communityTitle}</h3>
                  <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 font-mono text-[10px]">
                    {localPosts.length} {language === 'tr' ? 'Taktik' : 'Tactics'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{t.benchmarks.communitySubtitle}</p>
              </div>

              {/* Share Insight Modal Trigger */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/20 bg-transparent text-zinc-300 hover:text-white text-xs font-medium transition-colors self-start sm:self-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>{t.benchmarks.shareInsight}</span>
              </button>
            </div>

            {/* Post Feed */}
            <div className="space-y-4">
              {localPosts.map((post) => {
                const hasLiked = likedPosts[post.id];
                return (
                  <div
                    key={post.id}
                    className="p-6 rounded-xl border border-white/[0.06] bg-zinc-900/30 hover:border-white/[0.12] transition-colors space-y-3"
                  >
                    {/* Author Meta Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-xs font-medium text-zinc-200">
                          {post.authorName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-zinc-200">{post.authorName}</span>
                            <span className="text-[11px] text-zinc-400">• {post.authorStoreCategory}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-zinc-400">{post.authorBadge}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-emerald-400 font-mono text-[10px]">{post.verifiedRevenue}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">{post.timeAgo}</span>
                    </div>

                    {/* Title & Content */}
                    <h4 className="text-sm font-medium text-zinc-100 leading-snug">
                      {post.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Footer Row: Inline Tags & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
                      {/* Transparent inline tags with # symbol */}
                      <div className="flex items-center gap-2.5">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-mono text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer"
                          >
                            <span className="text-zinc-600 mr-0.5">#</span>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Upvote & Comment counts */}
                      <div className="flex items-center gap-3 text-xs">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${
                            hasLiked
                              ? 'text-white font-medium bg-zinc-800 border border-white/10'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-mono">{post.likes}</span>
                        </button>

                        <div className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 cursor-pointer">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="font-mono">{post.commentsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Share Insight Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#121215] p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <h4 className="text-sm font-semibold text-white">
                  {language === 'tr' ? 'Kendi Büyüme Taktiğini Toplulukla Paylaş' : 'Share Growth Tactic with Verified Merchants'}
                </h4>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  {language === 'tr' ? 'Taktik Başlığı' : 'Tactic Headline'}
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder={language === 'tr' ? 'Örn: Sepet terk edenleri geri kazandıran 3 adımlı SMS zincirimiz' : 'e.g. 3-step SMS sequence that recovered $12k abandonments'}
                  className="w-full bg-zinc-900 border border-white/[0.08] hover:border-white/[0.14] focus:border-white/25 rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  {language === 'tr' ? 'Kategori & Niş' : 'Store Niche & Category'}
                </label>
                <input
                  type="text"
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  placeholder="DTC Moda, Kozmetik, Mobilya vb."
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  {language === 'tr' ? 'Taktik Detayı & Rakamlar' : 'Detailed Tactic & Results'}
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                  placeholder={language === 'tr' ? 'Hangi problemi yaşadınız, nasıl çözdünüz ve somut getiri ne oldu?' : 'Describe what problem you faced, the exact solution and resulting numbers.'}
                  className="w-full bg-zinc-900 border border-white/[0.08] hover:border-white/[0.14] focus:border-white/25 rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none transition-colors leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  {language === 'tr' ? 'Etiketler (Virgülle Ayırın)' : 'Tags (Comma separated)'}
                </label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="Meta Ads, ROAS, Bundle, Klaviyo"
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  {language === 'tr' ? 'İptal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !postTitle.trim() || !postContent.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{language === 'tr' ? 'Toplulukta Yayınla' : 'Publish Tactic'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
