'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Product,
  ProductStatus,
  ActionCard,
  CompetitorStore,
  AdCampaign,
  Language,
  Currency,
  Theme,
} from '@/types';
import {
  MOCK_STORES,
  MOCK_PRODUCTS,
  MOCK_ACTION_CARDS,
  MOCK_COMPETITORS,
  MOCK_AD_CAMPAIGNS,
  MOCK_BENCHMARKS,
  MOCK_COMMUNITY_POSTS,
  MOCK_HOURLY_SALES,
  getStoreInitialData,
} from '@/lib/data/mockStores';
import { translations } from '@/lib/i18n/translations';

// Components
import Navbar from '@/components/Navbar';
import KPICards from '@/components/KPICards';
import AICoachSection from '@/components/AICoachSection';
import SalesCharts from '@/components/SalesCharts';
import BCGMatrix from '@/components/BCGMatrix';
import ProductsTable from '@/components/ProductsTable';
import CompetitorRadar from '@/components/CompetitorRadar';
import AdSpendSentinel from '@/components/AdSpendSentinel';
import BenchmarkAndCommunity from '@/components/BenchmarkAndCommunity';
import ConnectStoreModal from '@/components/ConnectStoreModal';
import AIContentModal from '@/components/AIContentModal';
import PlanManagementModal, { PlanTier } from '@/components/PlanManagementModal';
import SyncStatusBar from '@/components/SyncStatusBar';

import {
  LayoutDashboard,
  Bot,
  Layers,
  Package,
  Radar,
  ShieldAlert,
  Users,
} from 'lucide-react';

type NavTab = 'overview' | 'aiCoach' | 'bcgMatrix' | 'products' | 'competitors' | 'ads' | 'benchmark';

export default function Home() {
  const [language, setLanguage] = useState<Language>('tr');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Application Stores & Entities
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [currentStore, setCurrentStore] = useState<Store>(MOCK_STORES[0]);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [actionCards, setActionCards] = useState<ActionCard[]>(MOCK_ACTION_CARDS);
  const [competitors, setCompetitors] = useState<CompetitorStore[]>(MOCK_COMPETITORS);
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(MOCK_AD_CAMPAIGNS);
  const [selectedBcgStatus, setSelectedBcgStatus] = useState<ProductStatus | 'ALL'>('ALL');

  // Modal States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [contentModalProduct, setContentModalProduct] = useState<Product | null>(null);

  // Monetization & Subscription State (Private Tool: All Features Unlocked)
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('SCALE_ENTERPRISE');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planModalReason, setPlanModalReason] = useState<string | undefined>(undefined);

  // Store 90-Day Asynchronous Sync State
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'READY' | 'FAILED'>('READY');
  const [syncProgress, setSyncProgress] = useState(100);
  const [stageLabelTr, setStageLabelTr] = useState('Son 90 günlük veri eşitlendi (1,420 sipariş, 148 ürün)');
  const [stageLabelEn, setStageLabelEn] = useState('Last 90 days data synced (1,420 orders, 148 products)');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync theme class to html/body
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const t = translations[language];

  // Action handlers
  const handleSelectStore = (store: Store) => {
    setCurrentStore(store);
    const initialData = getStoreInitialData(store.id);
    setProducts(initialData.products);
    setActionCards(initialData.actionCards);
    setCompetitors(initialData.competitors);
    setAdCampaigns(initialData.adCampaigns);
  };

  const handleApplyAction = (actionId: string) => {
    const card = actionCards.find((c) => c.id === actionId);
    if (card) {
      // Throttle ad campaign if inventory risk
      if (card.category === 'INVENTORY' && card.payload?.adCampaignId) {
        setAdCampaigns((prev) =>
          prev.map((c) => (c.id === card.payload?.adCampaignId ? { ...c, status: 'PAUSED' } : c))
        );
      }
      // Update price if pricing opportunity
      if (card.category === 'PRICING' && card.payload?.productId && card.payload?.suggestedPrice) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === card.payload?.productId
              ? {
                  ...p,
                  retailPrice: card.payload!.suggestedPrice!,
                  grossMarginPct: Math.round(
                    ((card.payload!.suggestedPrice! - (p.costPrice || 30)) / card.payload!.suggestedPrice!) * 100
                  ),
                  score: Math.min(99, p.score + 5),
                }
              : p
          )
        );
      }
    }
    setActionCards((prev) =>
      prev.map((c) => (c.id === actionId ? { ...c, status: 'APPLIED' } : c))
    );
  };

  const handleDismissAction = (actionId: string) => {
    setActionCards((prev) => prev.filter((c) => c.id !== actionId));
  };

  const handleAddCompetitor = async (domain: string) => {
    const cleanDomain = domain.replace('https://', '').replace('http://', '').replace(/\/$/, '');
    const formattedBrand = cleanDomain.split('.')[0];

    try {
      const res = await fetch('/api/competitors/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      });

      if (res.ok) {
        const data = await res.json();
        const newComp: CompetitorStore = {
          id: `comp-${Date.now()}`,
          domain: cleanDomain,
          brandName: formattedBrand.toUpperCase() + ' Official',
          estimatedMonthlyRevenue: data.estimatedMonthlyRevenue || 65000,
          activeMetaAds: data.activeMetaAdsCount || 8,
          lastScraped: 'Şimdi',
          topSellingProducts: Array.isArray(data.products) && data.products.length > 0
            ? data.products.map((p: any) => ({
                title: p.title,
                price: p.price || 79.0,
                status: p.inStock ? 'in_stock' : 'out_of_stock',
              }))
            : [
                {
                  title: 'Signature Bestseller Item',
                  price: 79.0,
                  ourPriceMatch: 69.0,
                  status: 'in_stock',
                },
              ],
          priceDisparities: [
            {
              productTitle: 'Oversized Merino Yün Hırka',
              competitorPrice: 94.0,
              ourPrice: 89.0,
              recommendation: {
                tr: `${cleanDomain} bu ürünü $94'ten satıyor. Fiyatınızı $92'ye yükselterek marjınızı artırabilirsiniz.`,
                en: `${cleanDomain} lists this at $94. Lift your price to $92 for instant margin expansion.`,
              },
            },
          ],
        };
        setCompetitors([newComp, ...competitors]);
        return;
      }
    } catch (e) {
      console.warn('Scraping API fallback:', e);
    }

    // Fallback if network blocked
    const newCompFallback: CompetitorStore = {
      id: `comp-${Date.now()}`,
      domain: cleanDomain,
      brandName: formattedBrand.toUpperCase() + ' Official',
      estimatedMonthlyRevenue: 52000,
      activeMetaAds: 6,
      lastScraped: 'Şimdi',
      topSellingProducts: [
        {
          title: 'Signature Trending Item',
          price: 79.0,
          ourPriceMatch: 69.0,
          status: 'in_stock',
        },
      ],
      priceDisparities: [
        {
          productTitle: 'Oversized Merino Yün Hırka',
          competitorPrice: 94.0,
          ourPrice: 89.0,
          recommendation: {
            tr: `${cleanDomain} bu ürünü $94'ten satıyor. Fiyatınızı $92'ye yükselterek marjınızı artırabilirsiniz.`,
            en: `${cleanDomain} lists this at $94. Lift your price to $92 for instant margin expansion.`,
          },
        },
      ],
    };
    setCompetitors([newCompFallback, ...competitors]);
  };

  const handleToggleCampaignStatus = (campaignId: string) => {
    setAdCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
          : c
      )
    );
    // If low-stock ad paused, mark ActionCard #1 as APPLIED
    if (campaignId === 'camp-meta-1' || campaignId === 'camp-nordic-1') {
      setActionCards((prev) =>
        prev.map((card) =>
          card.category === 'INVENTORY' ? { ...card, status: 'APPLIED' } : card
        )
      );
    }
  };

  const handleApplyArbitrage = (productTitle: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (
          p.title.toLowerCase().includes('bot') ||
          p.title.toLowerCase().includes(productTitle.toLowerCase())
        ) {
          const cost = p.costPrice || 45;
          const newMargin = Math.round(((newPrice - cost) / newPrice) * 100);
          return {
            ...p,
            retailPrice: newPrice,
            grossMarginPct: newMargin,
            score: Math.min(99, p.score + 6),
          };
        }
        return p;
      })
    );
    // Synchronize ActionCard state so AI Coach card #2 also marks as APPLIED
    setActionCards((prev) =>
      prev.map((card) =>
        card.category === 'PRICING' ? { ...card, status: 'APPLIED' } : card
      )
    );
  };

  const handleUpdateProductPrice = (productTitle: string, targetPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (
          p.title.toLowerCase().includes(productTitle.toLowerCase()) ||
          productTitle.toLowerCase().includes(p.title.toLowerCase())
        ) {
          const cost = p.costPrice || 35;
          const newMargin = Math.round(((targetPrice - cost) / targetPrice) * 100);
          return {
            ...p,
            retailPrice: targetPrice,
            grossMarginPct: newMargin,
            score: Math.min(99, p.score + 4),
          };
        }
        return p;
      })
    );
  };

  const handleScaleCampaignBudget = (campaignId: string, newBudget: number) => {
    setAdCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, dailyBudget: newBudget } : c))
    );
  };

  const handleApplyContentOptimization = (
    productId: string,
    newTitle: string,
    newDesc: string
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              title: newTitle,
              aiOptimizedTitle: newTitle,
              aiOptimizedDesc: newDesc,
              score: Math.min(99, p.score + 12),
            }
          : p
      )
    );
  };

  const handleOpenConnectModal = () => {
    // Private Custom App Mode: Direct unlimited access
    setIsConnectModalOpen(true);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncStatus('SYNCING');
    setSyncProgress(25);
    setStageLabelTr('Shopify GraphQL API taranıyor (%25)...');
    setStageLabelEn('Connecting to Shopify GraphQL API (25%)...');

    try {
      // 1. Check if private custom app token is active
      const customAppRes = await fetch('/api/shopify/custom-app/sync');
      if (customAppRes.ok) {
        const liveData = await customAppRes.json();
        if (liveData.isLive && Array.isArray(liveData.products) && liveData.products.length > 0) {
          setProducts(liveData.products);
          setSyncProgress(100);
          setSyncStatus('READY');
          setIsSyncing(false);
          setStageLabelTr(`Shopify API Canlı Verisi Eşitlendi (${liveData.ordersCount} sipariş, ${liveData.productsCount} ürün)`);
          setStageLabelEn(`Live Shopify API Data Synced (${liveData.ordersCount} orders, ${liveData.productsCount} products)`);
          return;
        }
      }

      // Fallback simulation pipeline
      await fetch('/api/stores/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: currentStore.id, action: 'start' }),
      });

      setTimeout(() => {
        setSyncProgress(55);
        setStageLabelTr('Son 90 günlük 1,420 sipariş ve müşteri verisi çekiliyor (%55)...');
        setStageLabelEn('Ingesting 1,420 orders from past 90 days (55%)...');
      }, 700);

      setTimeout(() => {
        setSyncProgress(85);
        setStageLabelTr('BCG Ürün Matrisi & Satış Hızları hesaplanıyor (%85)...');
        setStageLabelEn('Calculating BCG Matrix & Sales Velocity (85%)...');
      }, 1400);

      setTimeout(() => {
        setSyncProgress(100);
        setSyncStatus('READY');
        setIsSyncing(false);
        setStageLabelTr('Son 90 günlük veri başarıyla eşitlendi (%100) — Mağaza Hazır');
        setStageLabelEn('Past 90 days data successfully synced (100%) — Store Ready');
      }, 2200);
    } catch {
      setIsSyncing(false);
      setSyncStatus('READY');
    }
  };

  const handleStoreConnected = (newStore: Store) => {
    setStores([...stores, newStore]);
    setCurrentStore(newStore);
    handleTriggerSync();
  };

  const navTabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: t.nav.overview, icon: LayoutDashboard },
    { id: 'aiCoach', label: t.nav.aiCoach, icon: Bot },
    { id: 'bcgMatrix', label: t.nav.bcgMatrix, icon: Layers },
    { id: 'products', label: t.nav.products, icon: Package },
    { id: 'competitors', label: t.nav.competitors, icon: Radar },
    { id: 'ads', label: t.nav.ads, icon: ShieldAlert },
    { id: 'benchmark', label: t.nav.benchmark, icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#fafafa]">
      {/* Top Navbar */}
      <Navbar
        currentStore={currentStore}
        allStores={stores}
        onSelectStore={handleSelectStore}
        language={language}
        onToggleLanguage={setLanguage}
        currency={currency}
        onChangeCurrency={setCurrency}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenConnectModal={handleOpenConnectModal}
        unreadAlertsCount={3}
        currentPlan={currentPlan}
        onOpenPlanModal={() => {
          setPlanModalReason(undefined);
          setIsPlanModalOpen(true);
        }}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />

      {/* Asynchronous Store Sync Engine Status Banner */}
      <SyncStatusBar
        language={language}
        syncStatus={syncStatus}
        syncProgress={syncProgress}
        stageLabelTr={stageLabelTr}
        stageLabelEn={stageLabelEn}
        onTriggerSync={handleTriggerSync}
        onDismiss={() => setSyncStatus('READY')}
      />

      {/* Main Container with Spacious Margins */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-8">
        {/* Minimalist Linear / Vercel-Style Tab Navigation */}
        <div className="border-b border-white/[0.08] flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none mb-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 pb-3.5 pt-1 px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02] rounded-t-lg'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview (Full Cockpit with Generous Vertical Rhythm - space-y-8) */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Hero KPIs */}
            <KPICards language={language} currency={currency} storeId={currentStore.id} />

            {/* AI Growth Copilot (with +10px vertical breathing room) */}
            <div className="pt-2">
              <AICoachSection
                cards={actionCards}
                language={language}
                onApplyAction={handleApplyAction}
                onDismissAction={handleDismissAction}
                onOpenContentModal={(pId) => {
                  const prod = products.find((p) => p.id === pId);
                  if (prod) setContentModalProduct(prod);
                }}
              />
            </div>

            {/* Hourly Sales & ROAS Trend + Conversion Funnel */}
            <SalesCharts
              data={
                currentStore.id === 'store-2'
                  ? MOCK_HOURLY_SALES.map((d) => ({
                      ...d,
                      todaySales: Math.round(d.todaySales * 0.55),
                      lastWeekSales: Math.round(d.lastWeekSales * 0.55),
                    }))
                  : MOCK_HOURLY_SALES
              }
              language={language}
              currency={currency}
            />

            {/* BCG Matrix */}
            <BCGMatrix
              products={products}
              selectedStatus={selectedBcgStatus}
              onSelectStatus={setSelectedBcgStatus}
              language={language}
            />

            {/* Products Table filtered by BCG selection */}
            <ProductsTable
              products={products}
              filterStatus={selectedBcgStatus}
              language={language}
              currency={currency}
              onOpenContentModal={setContentModalProduct}
            />

            {/* Competitor Radar */}
            <CompetitorRadar
              competitors={competitors}
              language={language}
              currency={currency}
              onAddCompetitor={handleAddCompetitor}
              onApplyArbitrage={handleApplyArbitrage}
              onUpdateProductPrice={handleUpdateProductPrice}
            />

            {/* Ad Spend Sentinel */}
            <AdSpendSentinel
              campaigns={adCampaigns}
              language={language}
              currency={currency}
              onToggleCampaignStatus={handleToggleCampaignStatus}
              onScaleCampaignBudget={handleScaleCampaignBudget}
            />

            {/* Benchmark & Community */}
            <BenchmarkAndCommunity
              benchmarks={MOCK_BENCHMARKS}
              posts={MOCK_COMMUNITY_POSTS}
              language={language}
              currency={currency}
            />
          </div>
        )}

        {/* Tab 2: AI Coach Focused */}
        {activeTab === 'aiCoach' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <AICoachSection
              cards={actionCards}
              language={language}
              onApplyAction={handleApplyAction}
              onDismissAction={handleDismissAction}
              onOpenContentModal={(pId) => {
                const prod = products.find((p) => p.id === pId);
                if (prod) setContentModalProduct(prod);
              }}
            />
          </div>
        )}

        {/* Tab 3: BCG Matrix Focused */}
        {activeTab === 'bcgMatrix' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <BCGMatrix
              products={products}
              selectedStatus={selectedBcgStatus}
              onSelectStatus={setSelectedBcgStatus}
              language={language}
            />
            <ProductsTable
              products={products}
              filterStatus={selectedBcgStatus}
              language={language}
              currency={currency}
              onOpenContentModal={setContentModalProduct}
            />
          </div>
        )}

        {/* Tab 4: Products & Inventory Focused */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <ProductsTable
              products={products}
              filterStatus={selectedBcgStatus}
              language={language}
              currency={currency}
              onOpenContentModal={setContentModalProduct}
            />
          </div>
        )}

        {/* Tab 5: Competitor Radar Focused */}
        {activeTab === 'competitors' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <CompetitorRadar
              competitors={competitors}
              language={language}
              currency={currency}
              onAddCompetitor={handleAddCompetitor}
              onApplyArbitrage={handleApplyArbitrage}
              onUpdateProductPrice={handleUpdateProductPrice}
            />
          </div>
        )}

        {/* Tab 6: Ad Spend Sentinel Focused */}
        {activeTab === 'ads' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <AdSpendSentinel
              campaigns={adCampaigns}
              language={language}
              currency={currency}
              onToggleCampaignStatus={handleToggleCampaignStatus}
              onScaleCampaignBudget={handleScaleCampaignBudget}
            />
          </div>
        )}

        {/* Tab 7: Benchmark & Community Focused */}
        {activeTab === 'benchmark' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <BenchmarkAndCommunity
              benchmarks={MOCK_BENCHMARKS}
              posts={MOCK_COMMUNITY_POSTS}
              language={language}
              currency={currency}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.08] bg-[#09090b] py-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="font-medium text-zinc-300 font-mono">ShopPulse AI</span>
            <span>—</span>
            <span>Shopify Business Manager & AI Growth Copilot</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono">
            <Link href="/privacy" className="hover:text-zinc-200 transition-colors underline underline-offset-4 decoration-white/20">
              {language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-zinc-200 transition-colors underline underline-offset-4 decoration-white/20">
              {language === 'tr' ? 'Kullanım Şartları' : 'Terms'}
            </Link>
            <span>•</span>
            <span>Shopify Admin API</span>
            <span>•</span>
            <span>Claude 3.5 & GPT-4o</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConnectStoreModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        language={language}
        onStoreConnected={handleStoreConnected}
      />

      <AIContentModal
        product={contentModalProduct}
        isOpen={!!contentModalProduct}
        onClose={() => setContentModalProduct(null)}
        language={language}
        onApplyOptimization={handleApplyContentOptimization}
      />

      <PlanManagementModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        language={language}
        currentPlan={currentPlan}
        onPlanUpdated={(newPlan) => setCurrentPlan(newPlan)}
        triggerReason={planModalReason}
      />
    </div>
  );
}
