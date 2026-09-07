'use client';

import React, { useState } from 'react';
import { Language } from '@/types';
import { translations } from '@/lib/i18n/translations';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  KeyRound,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConnectMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onConnected: (campaigns: any[]) => void;
}

export default function ConnectMetaModal({
  isOpen,
  onClose,
  language,
  onConnected,
}: ConnectMetaModalProps) {
  const [accessToken, setAccessToken] = useState('');
  const [adAccountId, setAdAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim() || !adAccountId.trim()) {
      setErrorMsg(
        language === 'tr'
          ? 'Lütfen Meta Access Token ve Reklam Hesabı Kimliğini girin.'
          : 'Please enter both Meta Access Token and Ad Account ID.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Normalize the account ID: add act_ prefix if missing
      const normalizedAccountId = adAccountId.trim().startsWith('act_')
        ? adAccountId.trim()
        : `act_${adAccountId.trim()}`;

      const res = await fetch('/api/meta/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          adAccountId: normalizedAccountId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Persist credentials to localStorage for subsequent API calls
        try {
          localStorage.setItem('meta_ad_account_id', normalizedAccountId);
          localStorage.setItem('meta_access_token', accessToken.trim());
          localStorage.setItem('meta_connected', 'true');
        } catch (storageErr) {
          console.warn('localStorage save failed:', storageErr);
        }

        setIsSuccess(true);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#1877f2', '#10b981', '#ffffff'],
          });
        } catch {}

        // Pass campaigns back to parent, allowing the Sentinel to update immediately
        const campaigns = data.campaigns || [];
        setTimeout(() => {
          onConnected(campaigns);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(
          data.error ||
            (language === 'tr'
              ? 'Meta Ads bağlantısı kurulamadı. Token veya Hesap ID bilgilerinizi kontrol edin.'
              : 'Meta Ads connection failed. Please check your token and account ID.')
        );
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          (language === 'tr'
            ? 'Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.'
            : 'Connection error occurred. Please check your internet connection.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1877f2', '#10b981', '#ffffff'],
        });
      } catch {}

      // Save demo mode indicator to localStorage
      try {
        localStorage.setItem('meta_ad_account_id', 'act_78490402974');
        localStorage.setItem('meta_connected', 'true');
      } catch {}

      setTimeout(() => {
        onConnected([
          {
            id: 'meta-camp-demo-1',
            platform: 'META',
            name: 'Advantage+ Shopping | Nightfold 3D Sleep Mask',
            status: 'ACTIVE',
            dailyBudget: 45.0,
            spendToday: 0,
            roasToday: 0,
            ctr: 0,
            cpc: 0,
            linkedProductName: 'Nightfold DeepRest 3D Sleep Mask',
            linkedProductStock: 36714,
            hasWarning: false,
          },
        ]);
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#101014] shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {language === 'tr' ? 'Meta Ads (Marketing API) Bağla' : 'Connect Meta Ads (Marketing API)'}
            </h3>
            <p className="text-xs text-zinc-400">
              {language === 'tr'
                ? 'Canlı Meta reklam harcamaları, CPC/CTR ve bütçe koruma kalkanı için hesabınızı bağlayın.'
                : 'Connect your ad account for real-time spend tracking, CPC/CTR, and Sentinel protection.'}
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">
              {language === 'tr' ? 'Meta Ads Başarıyla Bağlandı!' : 'Meta Ads Connected Successfully!'}
            </h4>
            <p className="text-xs text-zinc-400">
              {language === 'tr'
                ? 'Kampanya metrikleri ve bütçe kalkanı canlı olarak eşitlendi.'
                : 'Campaign metrics and spend sentinel are now synced in real time.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                {language === 'tr' ? 'Meta Reklam Hesabı ID (Ad Account ID):' : 'Meta Ad Account ID:'}
              </label>
              <input
                type="text"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                placeholder="act_123456789012345"
                className="w-full bg-zinc-900 border border-white/[0.08] focus:border-[#1877f2] rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 font-mono focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                {language === 'tr'
                  ? 'Meta Ads Manager URL adresindeki "act=..." parametresi. "act_" ön eki opsiyoneldir, otomatik eklenir.'
                  : 'Found in your Ads Manager URL as "act=...". The "act_" prefix is optional and will be auto-added.'}
              </p>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                {language === 'tr' ? 'Meta Access Token (System User / Graph API):' : 'Meta Access Token:'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAB..."
                  className="w-full bg-zinc-900 border border-white/[0.08] focus:border-[#1877f2] rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 font-mono focus:outline-none transition-colors"
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1.5">
                <span>{language === 'tr' ? 'ads_read, ads_management izinleri gerekir' : 'Requires ads_read, ads_management'}</span>
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1877f2] hover:underline flex items-center gap-1"
                >
                  <span>Meta Developers</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'tr' ? 'Doğrulanıyor...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <span>{language === 'tr' ? 'Meta Hesabını Bağla' : 'Connect Meta Account'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickDemoConnect}
                disabled={isLoading}
                className="w-full sm:w-auto py-2.5 px-3.5 rounded-lg border border-white/[0.1] hover:border-white/20 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
              >
                {language === 'tr' ? 'Simüle Mod (Tek Tıkla)' : 'Demo 1-Click'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
