'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Language, Currency } from '@/types';
import { translations } from '@/lib/i18n/translations';
import { PlanTier } from './PlanManagementModal';
import {
  ChevronDown,
  Plus,
  Bell,
  Sun,
  Moon,
  TrendingUp,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  LayoutDashboard,
  Megaphone,
} from 'lucide-react';

interface NavbarProps {
  currentStore: Store;
  allStores: Store[];
  onSelectStore: (store: Store) => void;
  onOpenConnectModal: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  currency: Currency;
  onChangeCurrency: (curr: Currency) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  unreadAlertsCount?: number;
  currentPlan?: PlanTier;
  onOpenPlanModal?: () => void;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
  onOpenCreativeStudio?: () => void;
  onOpenConnectMeta?: () => void;
}

export default function Navbar({
  currentStore,
  allStores,
  onSelectStore,
  onOpenConnectModal,
  language,
  onToggleLanguage,
  currency,
  onChangeCurrency,
  theme,
  onToggleTheme,
  unreadAlertsCount = 3,
  currentPlan = 'FREE_STARTER',
  onOpenPlanModal,
  onTriggerSync,
  isSyncing = false,
  onOpenCreativeStudio,
  onOpenConnectMeta,
}: NavbarProps) {
  const pathname = usePathname();
  const t = translations[language];
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand, Store Switcher & Navigation */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-100 font-mono font-semibold text-xs shadow-sm">
              SP
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-zinc-100">ShopPulse</span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">AI</span>
            </div>
          </Link>

          <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

          {/* Minimalist Store Switcher */}
          <div className="relative">
            <button
              onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/60 hover:bg-zinc-850 hover:border-white/15 text-xs text-zinc-200 transition-all font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
              <span className="truncate max-w-[110px] sm:max-w-[150px]">{currentStore.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {storeDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-white/[0.08] bg-[#121215] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                  {t.header.switchStore}
                </div>
                {allStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      onSelectStore(store);
                      setStoreDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      store.id === currentStore.id
                        ? 'bg-zinc-800 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      <span className="truncate">{store.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">{store.healthScore}</span>
                  </button>
                ))}
                <div className="my-1 border-t border-white/[0.06]" />

                {/* Re-sync option */}
                {onTriggerSync && (
                  <button
                    onClick={() => {
                      setStoreDropdownOpen(false);
                      onTriggerSync();
                    }}
                    disabled={isSyncing}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-850 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{language === 'tr' ? '90 Günlük Veriyi Eşitle' : 'Sync 90-Day Data'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setStoreDropdownOpen(false);
                    onOpenConnectModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{t.nav.connectStore}</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-white/[0.08] hidden md:block" />

          {/* Top Page Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pathname === '/'
                  ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/ads"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pathname === '/ads'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'tr' ? 'Reklam Yöneticisi' : 'Meta Ads'}</span>
              <span className="px-1 py-0.2 text-[9px] font-mono rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Meta
              </span>
            </Link>
          </nav>
        </div>

        {/* Right: Consolidated Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile quick page link */}
          <Link
            href={pathname === '/ads' ? '/' : '/ads'}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/60 text-xs text-zinc-300 font-medium hover:bg-zinc-850 transition-colors"
          >
            {pathname === '/ads' ? (
              <>
                <LayoutDashboard className="w-3.5 h-3.5 text-zinc-300" />
                <span>Dashboard</span>
              </>
            ) : (
              <>
                <Megaphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Ads</span>
              </>
            )}
          </Link>

          {/* Subtle Health Score Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] text-emerald-400">{t.header.healthScore}:</span>
            <span className="font-semibold text-xs text-emerald-400">{currentStore.healthScore}/100</span>
          </div>

          {/* Executive Private Tool Badge (All Features Unlocked) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'tr' ? 'Özel Mağaza • Tam Erişim' : 'Private App • Unlocked'}</span>
          </div>

          {/* Unified Preferences / Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/60 hover:bg-zinc-850 hover:border-white/15 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
              title="Tercihler / Preferences"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-mono text-zinc-400">
                {language} • {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {settingsDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-white/[0.08] bg-[#121215] shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 space-y-2.5">
                {/* Language section */}
                <div>
                  <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider px-1 mb-1">
                    {language === 'tr' ? 'Dil Seçimi' : 'Language'}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {(['tr', 'en'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          onToggleLanguage(lang);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                          language === lang
                            ? 'bg-zinc-800 text-zinc-100 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                        }`}
                      >
                        {lang === 'tr' ? 'Türkçe' : 'English'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.06]" />

                {/* Currency section */}
                <div>
                  <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider px-1 mb-1">
                    {language === 'tr' ? 'Para Birimi' : 'Currency'}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['USD', 'EUR', 'TRY'] as Currency[]).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          onChangeCurrency(curr);
                        }}
                        className={`py-1.5 rounded-lg font-mono text-xs transition-colors ${
                          currency === curr
                            ? 'bg-zinc-800 text-zinc-100 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.06]" />

                {/* Theme section */}
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <span className="text-[11px] text-zinc-400">
                    {language === 'tr' ? 'Tema' : 'Theme'}
                  </span>
                  <button
                    onClick={onToggleTheme}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/[0.08] hover:bg-zinc-850 text-zinc-300 text-xs transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Moon className="w-3 h-3 text-zinc-400" />
                        <span>Dark</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3 h-3 text-zinc-400" />
                        <span>Light</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Icon Button */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 rounded-xl border border-white/[0.08] bg-[#121215] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-xs font-medium text-zinc-200">{t.header.notifications}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">3 new</span>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
                    <span className="text-[11px] font-medium text-emerald-400 block mb-0.5">Stok & Katalog</span>
                    <p className="text-[10px] text-zinc-400">Nightfold 3D Uyku Maskesi: 36.714 adet stok hazır.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
                    <span className="text-[11px] font-medium text-amber-400 block mb-0.5">Rakip Fiyat Radarı</span>
                    <p className="text-[10px] text-zinc-400">Manta Sleep PRO $39.99 ($5 arbitraj avantajı aktif).</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Creative Studio CTA Button */}
          {onOpenCreativeStudio && (
            <button
              onClick={onOpenCreativeStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">{language === 'tr' ? 'İçerik Stüdyosu' : 'Creative Studio'}</span>
            </button>
          )}

          {/* Matte Refined White CTA Button (Linear / Stripe Style) */}
          <button
            onClick={onOpenConnectModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-medium transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-900" />
            <span className="hidden sm:inline">{t.nav.connectStore}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
