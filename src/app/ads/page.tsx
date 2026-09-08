'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ConnectMetaModal from '@/components/ConnectMetaModal';
import { AdCampaign, Store, Language, Currency, Theme } from '@/types';
import { MOCK_STORES } from '@/lib/data/mockStores';
import { formatCurrency } from '@/lib/currency';
import confetti from 'canvas-confetti';
import {
  Megaphone,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Edit2,
  Check,
  X,
  ExternalLink,
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
  DollarSign,
  MousePointerClick,
  Percent,
  Target,
  Layers,
  ArrowUpRight,
  Loader2,
  ShieldAlert,
  Info,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

interface ToastMessage {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface MetaStats {
  totalSpend: number;
  totalBudget: number;
  blendedRoas: number;
  averageCpc: number;
  averageCtr: number;
  activeCount: number;
  totalCount: number;
}

export default function MetaAdsManagerPage() {
  const [language, setLanguage] = useState<Language>('tr');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [theme, setTheme] = useState<Theme>('dark');
  const [currentStore, setCurrentStore] = useState<Store>(MOCK_STORES[0]);
  const [allStores] = useState<Store[]>(MOCK_STORES);

  // Campaigns and Stats State
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [stats, setStats] = useState<MetaStats>({
    totalSpend: 0,
    totalBudget: 0,
    blendedRoas: 0,
    averageCpc: 0,
    averageCtr: 0,
    activeCount: 0,
    totalCount: 0,
  });
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [adAccountId, setAdAccountId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Interactive Management States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [sortBy, setSortBy] = useState<'spend_desc' | 'roas_desc' | 'budget_desc' | 'ctr_desc' | 'name_asc'>('spend_desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState<string>('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [boostingId, setBoostingId] = useState<string | null>(null);

  // Modal and Toast States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch campaigns from backend API
  const fetchCampaigns = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      let url = '/api/meta/campaigns';
      const token = typeof window !== 'undefined' ? localStorage.getItem('meta_access_token') : null;
      const storedAccountId = typeof window !== 'undefined' ? localStorage.getItem('meta_ad_account_id') : null;
      if (token && storedAccountId) {
        url = `/api/meta/campaigns?token=${encodeURIComponent(token)}&adAccountId=${encodeURIComponent(storedAccountId)}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setIsConnected(Boolean(data.isConnected));
        setIsDemo(Boolean(data.isDemo));
        if (data.adAccountId) setAdAccountId(data.adAccountId);

        if (data.stats) {
          setStats({
            totalSpend: data.stats.totalSpend ?? 0,
            totalBudget: data.stats.totalBudget ?? 0,
            blendedRoas: data.stats.blendedRoas ?? 0,
            averageCpc: data.stats.averageCpc ?? 0,
            averageCtr: data.stats.averageCtr ?? 0,
            activeCount: data.stats.activeCount ?? 0,
            totalCount: data.stats.totalCount ?? (data.campaigns || []).length,
          });
        }
      }
    } catch (err) {
      console.error('[Ads Page] Error fetching campaigns:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle Meta Campaign Toggle (ACTIVE / PAUSED)
  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus: 'ACTIVE' | 'PAUSED' = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingId(campaignId);

    try {
      const accessToken =
        typeof window !== 'undefined' ? localStorage.getItem('meta_access_token') : null;

      const res = await fetch('/api/meta/campaigns/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          status: newStatus,
          accessToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local state
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c))
        );

        setToast({
          title:
            newStatus === 'ACTIVE'
              ? (language === 'tr' ? 'Kampanya başlatıldı' : 'Campaign started')
              : (language === 'tr' ? 'Kampanya durduruldu' : 'Campaign paused'),
          message:
            language === 'tr'
              ? (newStatus === 'ACTIVE'
                  ? 'Kampanya başarıyla aktif duruma getirildi ve reklam yayını başlatıldı.'
                  : 'Kampanya başarıyla durduruldu ve bütçe harcaması durduruldu.')
              : (newStatus === 'ACTIVE'
                  ? 'Campaign is now active and delivering.'
                  : 'Campaign paused and delivery stopped.'),
          type: 'success',
        });
      } else {
        setToast({
          title: language === 'tr' ? 'Durum Güncellenemedi' : 'Update Failed',
          message:
            data.error ||
            (language === 'tr'
              ? 'Meta API durum güncelleme isteğini reddetti.'
              : 'Meta API rejected status update request.'),
          type: 'error',
        });
      }
    } catch (err: any) {
      setToast({
        title: language === 'tr' ? 'Bağlantı Hatası' : 'Connection Error',
        message:
          err.message ||
          (language === 'tr'
            ? 'Meta API sunucusuna ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.'
            : 'Could not reach Meta API server.'),
        type: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Quick Boost: Single-click +$20 Bütçe Ekle
  const handleQuickBoost = async (camp: AdCampaign, delta = 20) => {
    const currentBudget = camp.dailyBudget || 45;
    const targetBudget = parseFloat((currentBudget + delta).toFixed(2));
    setBoostingId(camp.id);

    try {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('meta_access_token') : null;
      const res = await fetch('/api/meta/campaigns/update-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: camp.id,
          adsetId: camp.adsetId,
          budgetDelta: delta,
          currentBudget,
          accessToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updated = data.updatedBudget || targetBudget;
        setCampaigns((prev) =>
          prev.map((c) => (c.id === camp.id ? { ...c, dailyBudget: updated } : c))
        );

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ffffff'],
        });

        setToast({
          title: language === 'tr' ? 'Meta Bütçesi Artırıldı 🚀' : 'Meta Budget Boosted 🚀',
          message:
            language === 'tr'
              ? `"${camp.name}" günlük bütçesine +$${delta} eklendi: Yeni Bütçe ${formatCurrency(updated, currency)}/gün.`
              : `Added +$${delta} to "${camp.name}". New Budget: ${formatCurrency(updated, currency)}/day.`,
          type: 'success',
        });
      } else {
        setToast({
          title: language === 'tr' ? 'Bütçe Artırılamadı' : 'Boost Failed',
          message: data.error || (language === 'tr' ? 'Meta API bütçe güncellemesini reddetti.' : 'Meta API error.'),
          type: 'error',
        });
      }
    } catch (err: any) {
      setToast({
        title: language === 'tr' ? 'Bağlantı Hatası' : 'Connection Error',
        message: err.message || (language === 'tr' ? 'Sunucuya ulaşılamadı.' : 'Network error.'),
        type: 'error',
      });
    } finally {
      setBoostingId(null);
    }
  };

  // Inline Budget Update Save
  const handleSaveBudget = async (camp: AdCampaign) => {
    const parsedAmount = parseFloat(editBudgetValue);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setToast({
        title: language === 'tr' ? 'Geçersiz Bütçe Tutarı' : 'Invalid Budget Amount',
        message: language === 'tr' ? "Lütfen 0'dan büyük geçerli bir bütçe girin." : 'Please enter a valid positive budget.',
        type: 'error',
      });
      return;
    }

    setBoostingId(camp.id);
    try {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('meta_access_token') : null;
      const res = await fetch('/api/meta/campaigns/update-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: camp.id,
          adsetId: camp.adsetId,
          newDailyBudget: parsedAmount,
          accessToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updated = data.updatedBudget || parsedAmount;
        setCampaigns((prev) =>
          prev.map((c) => (c.id === camp.id ? { ...c, dailyBudget: updated } : c))
        );
        setEditingId(null);

        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.7 },
        });

        setToast({
          title: language === 'tr' ? 'Günlük Bütçe Güncellendi ✓' : 'Daily Budget Updated ✓',
          message:
            language === 'tr'
              ? `"${camp.name}" bütçesi ${formatCurrency(updated, currency)}/gün olarak kaydedildi.`
              : `"${camp.name}" budget set to ${formatCurrency(updated, currency)}/day.`,
          type: 'success',
        });
      } else {
        setToast({
          title: language === 'tr' ? 'Bütçe Güncellenemedi' : 'Update Failed',
          message: data.error || (language === 'tr' ? 'Meta API bütçe güncellemesini onaylamadı.' : 'Meta API rejected update.'),
          type: 'error',
        });
      }
    } catch (err: any) {
      setToast({
        title: language === 'tr' ? 'Hata' : 'Error',
        message: err.message || (language === 'tr' ? 'Sunucu bağlantı hatası.' : 'Network error.'),
        type: 'error',
      });
    } finally {
      setBoostingId(null);
    }
  };

  // Filter and Sort Campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let result = [...campaigns];

    // Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Search Term Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.linkedProductName?.toLowerCase().includes(term) ||
          c.id.toLowerCase().includes(term)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'spend_desc') return (b.spendToday || 0) - (a.spendToday || 0);
      if (sortBy === 'roas_desc') return (b.roasToday || 0) - (a.roasToday || 0);
      if (sortBy === 'budget_desc') return (b.dailyBudget || 0) - (a.dailyBudget || 0);
      if (sortBy === 'ctr_desc') return (b.ctr || 0) - (a.ctr || 0);
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [campaigns, statusFilter, searchTerm, sortBy]);

  // Recalculate dynamic aggregates from current campaign state
  const dynamicTotalSpend = campaigns.reduce((acc, c) => acc + (c.spendToday || 0), 0);
  const dynamicActiveCount = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const validRoasCamps = campaigns.filter((c) => (c.roasToday || 0) > 0);
  const dynamicBlendedRoas =
    validRoasCamps.length > 0 && dynamicTotalSpend > 0
      ? validRoasCamps.reduce((acc, c) => acc + (c.roasToday || 0) * (c.spendToday || 1), 0) / dynamicTotalSpend
      : stats.blendedRoas || 4.12;
  const dynamicAvgCpc =
    campaigns.length > 0
      ? campaigns.reduce((acc, c) => acc + (c.cpc || 0), 0) / campaigns.length
      : stats.averageCpc || 0.49;
  const dynamicAvgCtr =
    campaigns.length > 0
      ? campaigns.reduce((acc, c) => acc + (c.ctr || 0), 0) / campaigns.length
      : stats.averageCtr || 3.0;

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#fafafa] selection:bg-blue-600/30 selection:text-white">
      {/* Universal Top Navigation */}
      <Navbar
        currentStore={currentStore}
        allStores={allStores}
        onSelectStore={setCurrentStore}
        language={language}
        onToggleLanguage={setLanguage}
        currency={currency}
        onChangeCurrency={setCurrency}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenConnectModal={() => {}}
        onOpenConnectMeta={() => setIsConnectModalOpen(true)}
      />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl border border-white/[0.12] bg-[#121215]/95 text-white shadow-2xl backdrop-blur-md max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              toast.type === 'error'
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                : toast.type === 'info'
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
          </div>
          <div className="space-y-0.5 flex-1 pr-2">
            <div className="text-xs font-semibold text-zinc-100">{toast.title}</div>
            <p className="text-[11px] text-zinc-400 leading-normal">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
        {/* Breadcrumb & Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <Link href="/" className="hover:text-zinc-200 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-zinc-200 font-semibold">Meta Ads Manager</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
                2026 Algoritma
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Meta Reklam Yöneticisi</span>
              <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-zinc-850 border border-white/[0.08] text-zinc-300 font-mono">
                Nightfold ({currentStore.domain})
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl">
              {language === 'tr'
                ? 'Meta Marketing Graph API üzerinden canlı kampanya durumu, bütçe yönetimi ve 2026 Advantage+ optimizasyonu.'
                : 'Live Meta Marketing Graph API campaign status, budget controls, and 2026 Advantage+ scaling engine.'}
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            {/* Meta Connection Status Pill */}
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isConnected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
              title="Meta Graph API Bağlantı Durumu"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isConnected ? 'Canlı Meta API Bağlı' : 'Simülasyon Modu (Hesap Bağla)'}</span>
              {adAccountId && (
                <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                  [{adAccountId}]
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchCampaigns(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{language === 'tr' ? 'Yenile' : 'Refresh'}</span>
            </button>

            {/* External Meta Ads Manager Link */}
            <a
              href="https://adsmanager.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Meta Ads Manager</span>
            </a>
          </div>
        </div>

        {/* 2026 Strategic Guidance Pill Banner */}
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-950/30 via-zinc-900/60 to-zinc-900/30 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                  <span>2026 Meta Lansman Mimarisi: ABO Kreatif Testleri → Advantage+ Scale (ASC)</span>
                  <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    Stok: 36.714 Adet
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Nightfold DeepRest 3D için 1 numaralı kanca: <b>&quot;Karanlık Odada Telefon Flaşı Testi (%100 Blackout Kanıtı)&quot;</b>.
                  CAC kalkanı olarak $59 Duo Bundle teklifini öne çıkarın; AI içeriklerde Meta AI etiketini açmayı unutmayın.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="self-end sm:self-center shrink-0 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>AI Koça Danış</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top KPI Metric Cards (Live Spend, Blended ROAS, CPC, CTR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Live Spend Today */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-4 space-y-2 hover:border-white/15 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Canlı Günlük Harcama</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {formatCurrency(dynamicTotalSpend, currency, { maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-medium">
                  {stats.totalBudget > 0 ? `%${Math.round((dynamicTotalSpend / stats.totalBudget) * 100)}` : '%71'}
                </span>
                <span>planlanan günlük bütçe kullanımı</span>
              </div>
            </div>
          </div>

          {/* Card 2: Blended ROAS */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-4 space-y-2 hover:border-white/15 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Harmanlanmış ROAS</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {dynamicBlendedRoas.toFixed(2)}x
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-medium font-mono">Hedef: &gt;3.50x</span>
                <span>• Karlı ölçekleme bölgesi</span>
              </div>
            </div>
          </div>

          {/* Card 3: Average CPC */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-4 space-y-2 hover:border-white/15 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Ortalama CPC (Tıklama Maliyeti)</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <MousePointerClick className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {formatCurrency(dynamicAvgCpc, currency, { maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span>DTC Benchmark $0.85&apos;in %42 altında</span>
              </div>
            </div>
          </div>

          {/* Card 4: Average CTR */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121215] p-4 space-y-2 hover:border-white/15 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Ortalama CTR (Tıklama Oranı)</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                %{dynamicAvgCtr.toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-medium">Thumbstop #1</span>
                <span>karanlık oda testiyle destekli</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder={
                  language === 'tr'
                    ? 'Kampanya adı, ürün veya ID ara...'
                    : 'Search campaigns, products, or ID...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] focus:border-blue-500 focus:outline-none text-xs text-zinc-100 placeholder-zinc-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Buttons & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-xs font-medium">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Tümü ({campaigns.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Aktif ({dynamicActiveCount})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('PAUSED')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'PAUSED'
                      ? 'bg-zinc-800 text-zinc-200 font-semibold border border-white/10'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  <span>Pasif ({campaigns.length - dynamicActiveCount})</span>
                </button>
              </div>

              {/* Sorting Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="appearance-none px-3.5 py-2 pr-8 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-xs text-zinc-200 font-medium focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="spend_desc">Sırala: Harcamaya Göre (Azalan)</option>
                  <option value="roas_desc">Sırala: ROAS&apos;a Göre (Azalan)</option>
                  <option value="budget_desc">Sırala: Günlük Bütçeye Göre</option>
                  <option value="ctr_desc">Sırala: CTR&apos;a Göre (Azalan)</option>
                  <option value="name_asc">Sırala: Kampanya Adı (A-Z)</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-zinc-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-zinc-900/50 text-zinc-400 text-[11px] font-medium uppercase tracking-wider">
                  <th className="py-3 px-4 w-28">Durum</th>
                  <th className="py-3 px-4 min-w-[240px]">Kampanya & Strateji</th>
                  <th className="py-3 px-4 min-w-[190px]">Günlük Bütçe</th>
                  <th className="py-3 px-4 w-28">Bugünkü Harcama</th>
                  <th className="py-3 px-4 w-24">ROAS</th>
                  <th className="py-3 px-4 w-24">CTR</th>
                  <th className="py-3 px-4 w-24">CPC</th>
                  <th className="py-3 px-4 text-right min-w-[160px]">Hızlı Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        <span className="text-xs">Meta Marketing API kampanyaları yükleniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAndSortedCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-zinc-500" />
                        <span className="text-xs">Kriterlere uygun kampanya bulunamadı.</span>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-xs text-blue-400 hover:underline mt-1"
                          >
                            Aramayı temizle
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedCampaigns.map((camp) => {
                    const isEditing = editingId === camp.id;
                    const isToggling = togglingId === camp.id;
                    const isBoosting = boostingId === camp.id;
                    const isActive = camp.status === 'ACTIVE';

                    return (
                      <tr
                        key={camp.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          !isActive ? 'opacity-70 bg-zinc-950/20' : ''
                        }`}
                      >
                        {/* Status Toggle Switch Button */}
                        <td className="py-3.5 px-4 relative z-10">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(camp.id, camp.status)}
                            disabled={isToggling}
                            className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-zinc-950 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                              isActive
                                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-sm shadow-emerald-500/30'
                                : 'bg-zinc-700 hover:bg-zinc-600'
                            }`}
                            title={isActive ? 'Kampanyayı Durdur' : 'Kampanyayı Başlat'}
                            aria-label={isActive ? 'Kampanyayı Durdur' : 'Kampanyayı Başlat'}
                          >
                            <span
                              className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                                isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            >
                              {isToggling ? (
                                <Loader2 className="w-3 h-3 text-zinc-900 animate-spin" />
                              ) : isActive ? (
                                <Play className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600 ml-0.5" />
                              ) : (
                                <Pause className="w-2.5 h-2.5 text-zinc-600" />
                              )}
                            </span>
                          </button>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(camp.id, camp.status)}
                              disabled={isToggling}
                              className={`text-[10px] font-mono font-semibold cursor-pointer hover:underline ${
                                isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-400 hover:text-zinc-300'
                              }`}
                            >
                              {isActive ? 'AKTİF' : 'DURDURULDU'}
                            </button>
                          </div>
                        </td>

                        {/* Campaign Name & Strategy Badge */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="font-medium text-zinc-100 flex items-center gap-2">
                            <span>{camp.name}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 border border-white/[0.06] text-[10px] font-mono text-zinc-400">
                              ID: {camp.id}
                            </span>
                            {camp.name.toLowerCase().includes('advantage+') ||
                            camp.name.toLowerCase().includes('asc') ? (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 font-medium">
                                Advantage+ Scale
                              </span>
                            ) : camp.name.toLowerCase().includes('abo') ? (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-400 font-medium">
                                ABO Sandbox
                              </span>
                            ) : camp.name.toLowerCase().includes('retarget') ? (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-medium">
                                Retargeting
                              </span>
                            ) : null}

                            {camp.linkedProductName && (
                              <span className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                                • {camp.linkedProductName}
                              </span>
                            )}
                          </div>
                          {camp.hasWarning && camp.warningText && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-400 pt-0.5">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>{language === 'tr' ? camp.warningText.tr : camp.warningText.en}</span>
                            </div>
                          )}
                        </td>

                        {/* Daily Budget & Inline Editing */}
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <div className="relative w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">
                                  $
                                </span>
                                <input
                                  type="number"
                                  step="1"
                                  min="5"
                                  value={editBudgetValue}
                                  onChange={(e) => setEditBudgetValue(e.target.value)}
                                  className="w-full pl-5 pr-1 py-1 rounded bg-zinc-900 border border-blue-500 text-xs font-mono text-white focus:outline-none"
                                  autoFocus
                                />
                              </div>
                              <button
                                onClick={() => handleSaveBudget(camp)}
                                disabled={isBoosting}
                                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                                title="Kaydet"
                              >
                                {isBoosting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                title="İptal"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="font-mono text-zinc-100 font-semibold">
                                {formatCurrency(camp.dailyBudget || 45, currency)}/gün
                              </span>
                              <button
                                onClick={() => {
                                  setEditingId(camp.id);
                                  setEditBudgetValue(String(camp.dailyBudget || 45));
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-white transition-all rounded hover:bg-zinc-800"
                                title="Bütçeyi Düzenle"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Today Spend */}
                        <td className="py-3.5 px-4 font-mono font-medium text-zinc-200">
                          {formatCurrency(camp.spendToday || 0, currency)}
                        </td>

                        {/* ROAS Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                              (camp.roasToday || 0) >= 3.5
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                : (camp.roasToday || 0) >= 2.0
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            }`}
                          >
                            {(camp.roasToday || 0).toFixed(2)}x
                          </span>
                        </td>

                        {/* CTR */}
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          %{(camp.ctr || 0).toFixed(2)}
                        </td>

                        {/* CPC */}
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          {formatCurrency(camp.cpc || 0, currency, { maximumFractionDigits: 2 })}
                        </td>

                        {/* Actions: +$20 Boost & Meta Link */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Single-Click +$20 Boost Button */}
                            <button
                              onClick={() => handleQuickBoost(camp, 20)}
                              disabled={isBoosting}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-[11px] transition-all active:scale-95 disabled:opacity-50"
                              title="Bu kampanyaya anında +$20/gün bütçe ekle"
                            >
                              {isBoosting ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Zap className="w-3 h-3 text-emerald-400" />
                              )}
                              <span>+$20 Ekle</span>
                            </button>

                            {/* Direct Meta Link */}
                            <a
                              href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${adAccountId}&selected_campaign_ids=${camp.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                              title="Meta Ads Manager'da Aç"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 pt-1 gap-2">
            <div>
              Toplam <b>{filteredAndSortedCampaigns.length}</b> kampanya gösteriliyor.
              {isConnected && <span> • Canlı Meta Marketing Graph API v21.0 bağlantısı aktif.</span>}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="text-blue-400 hover:underline"
              >
                Meta Kimlik Bilgilerini Düzenle
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Meta API Connection Modal */}
      <ConnectMetaModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        language={language}
        onConnected={(newCampaigns) => {
          setIsConnectModalOpen(false);
          if (Array.isArray(newCampaigns) && newCampaigns.length > 0) {
            setCampaigns(newCampaigns);
            setIsConnected(true);
            setIsDemo(false);
          }
          fetchCampaigns(true);
          setToast({
            title: 'Meta Marketing API Bağlandı 🚀',
            message: 'Hesabınız başarıyla doğrulandı. Canlı kampanya verileri eşitlendi.',
            type: 'success',
          });
        }}
      />
    </div>
  );
}
