export type Language = 'tr' | 'en';
export type Currency = 'USD' | 'EUR' | 'TRY';
export type Theme = 'dark' | 'light';

export type ProductStatus = 'STAR' | 'QUESTION_MARK' | 'CASH_COW' | 'ZOMBIE_DOG';
export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionCategory = 'PRICING' | 'INVENTORY' | 'ADS' | 'CONTENT' | 'BUNDLE';
export type ActionStatus = 'PENDING' | 'ACCEPTED' | 'DISMISSED' | 'APPLIED';

export interface Store {
  id: string;
  name: string;
  domain: string;
  currency: Currency;
  healthScore: number;
  monthlyRevenue: number;
  category: string;
  lastSynced: string;
  avatarUrl?: string;
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  handle: string;
  sku: string;
  category: string;
  status: ProductStatus;
  score: number; // 0-100
  retailPrice: number;
  costPrice: number;
  inventory: number;
  daysOfInventory: number;
  velocity30Days: number; // units/day
  grossMarginPct: number;
  imageUrl: string;
  aiOptimizedTitle?: string;
  aiOptimizedDesc?: string;
  conversionRate: number; // %
  adSpend30Days: number;
}

export interface ActionCard {
  id: string;
  storeId: string;
  title: {
    tr: string;
    en: string;
  };
  description: {
    tr: string;
    en: string;
  };
  rationale: {
    tr: string;
    en: string;
  };
  category: ActionCategory;
  priority: ActionPriority;
  status: ActionStatus;
  impactEstimate: {
    tr: string;
    en: string;
  };
  suggestedActionText: {
    tr: string;
    en: string;
  };
  payload?: {
    productId?: string;
    suggestedPrice?: number;
    currentPrice?: number;
    adCampaignId?: string;
    bundleProductIds?: string[];
  };
}

export interface CompetitorStore {
  id: string;
  domain: string;
  brandName: string;
  estimatedMonthlyRevenue: number;
  activeMetaAds: number;
  topSellingProducts: {
    title: string;
    price: number;
    ourPriceMatch?: number;
    status: 'in_stock' | 'out_of_stock';
    imageUrl?: string;
  }[];
  priceDisparities: {
    productTitle: string;
    competitorPrice: number;
    ourPrice: number;
    recommendation: {
      tr: string;
      en: string;
    };
  }[];
  lastScraped: string;
}

export interface AdCampaign {
  id: string;
  adsetId?: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  dailyBudget: number;
  spendToday: number;
  roasToday: number;
  ctr: number;
  cpc: number;
  linkedProductName?: string;
  linkedProductStock?: number;
  hasWarning?: boolean;
  warningText?: {
    tr: string;
    en: string;
  };
}

export interface CategoryBenchmark {
  category: string;
  metric: string;
  storeValue: number;
  benchmarkValue: number;
  percentileRank: number;
  isHigherBetter: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorStoreCategory: string;
  authorBadge: string;
  verifiedRevenue: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
  tags: string[];
}

export interface SalesDataPoint {
  time: string;
  todaySales: number;
  lastWeekSales: number;
  todayRoas: number;
  lastWeekRoas: number;
}
