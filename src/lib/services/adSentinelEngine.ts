import { AdCampaign, Product } from '@/types';

export interface SentinelRule {
  id: string;
  name: string;
  type: 'LOW_STOCK_PROTECTION' | 'LOW_ROAS_BLEED' | 'HIGH_PERFORMER_SCALE';
  threshold: number;
  isEnabled: boolean;
}

export interface SentinelAuditResult {
  campaignId: string;
  campaignName: string;
  platform: 'META' | 'GOOGLE' | 'TIKTOK';
  currentSpend: number;
  currentRoas: number;
  linkedStock?: number;
  riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  actionRecommended: 'NONE' | 'THROTTLE_BUDGET' | 'PAUSE_CAMPAIGN' | 'SCALE_BUDGET';
  estimatedSavings: number;
  message: {
    tr: string;
    en: string;
  };
}

export const DEFAULT_SENTINEL_RULES: SentinelRule[] = [
  {
    id: 'rule-1',
    name: 'Kritik Stok Harcama Kalkanı',
    type: 'LOW_STOCK_PROTECTION',
    threshold: 5, // 5 günden az stok kaldıysa tetiklenir
    isEnabled: true,
  },
  {
    id: 'rule-2',
    name: 'Düşük ROAS Bütçe Koruması',
    type: 'LOW_ROAS_BLEED',
    threshold: 1.5, // ROAS 1.5x altındaysa tetiklenir
    isEnabled: true,
  },
  {
    id: 'rule-3',
    name: 'Yüksek Performans Bütçe Artırma',
    type: 'HIGH_PERFORMER_SCALE',
    threshold: 4.0, // ROAS 4.0x üzerindeyse ve stok sağlamsa
    isEnabled: true,
  },
];

export function auditAdCampaigns(
  campaigns: AdCampaign[],
  products: Product[],
  rules = DEFAULT_SENTINEL_RULES
): SentinelAuditResult[] {
  return campaigns.map((camp) => {
    // Find linked product by name matching or direct reference
    const linkedProduct = products.find(
      (p) => camp.linkedProductName && p.title.toLowerCase().includes(camp.linkedProductName.toLowerCase())
    );

    const stockDays = linkedProduct ? linkedProduct.daysOfInventory : 999;
    const stockQty = camp.linkedProductStock ?? (linkedProduct ? linkedProduct.inventory : 100);

    // Rule 1: Low Stock Protection
    const stockRule = rules.find((r) => r.type === 'LOW_STOCK_PROTECTION' && r.isEnabled);
    if (stockRule && (stockDays <= stockRule.threshold || stockQty <= 20) && camp.spendToday > 30) {
      const estimatedSavings = Math.round(camp.dailyBudget * 0.4 * 7); // 7 günlük korunan israf
      return {
        campaignId: camp.id,
        campaignName: camp.name,
        platform: camp.platform,
        currentSpend: camp.spendToday,
        currentRoas: camp.roasToday,
        linkedStock: stockQty,
        riskLevel: 'CRITICAL',
        actionRecommended: 'THROTTLE_BUDGET',
        estimatedSavings,
        message: {
          tr: `Stok ${stockQty} adede geriledi (${stockDays} gün). Reklam tükenmiş sayfaya trafik göndermeden bütçeyi %40 kısın.`,
          en: `Stock down to ${stockQty} units (${stockDays} days). Throttle budget by 40% to prevent traffic bouncing on sold-out landing pages.`,
        },
      };
    }

    // Rule 2: Low ROAS Bleed
    const roasRule = rules.find((r) => r.type === 'LOW_ROAS_BLEED' && r.isEnabled);
    if (roasRule && camp.roasToday < roasRule.threshold && camp.spendToday > 25) {
      const estimatedSavings = Math.round(camp.spendToday * 0.7);
      return {
        campaignId: camp.id,
        campaignName: camp.name,
        platform: camp.platform,
        currentSpend: camp.spendToday,
        currentRoas: camp.roasToday,
        linkedStock: stockQty,
        riskLevel: 'WARNING',
        actionRecommended: 'PAUSE_CAMPAIGN',
        estimatedSavings,
        message: {
          tr: `Günün ROAS'ı ${camp.roasToday}x ile 1.5x eşiğinin altında. Reklam setini inceleyin veya durdurun.`,
          en: `Today's ROAS is ${camp.roasToday}x, below the 1.5x threshold. Review creative or pause set.`,
        },
      };
    }

    // Rule 3: High Performer Scale Opportunity
    const scaleRule = rules.find((r) => r.type === 'HIGH_PERFORMER_SCALE' && r.isEnabled);
    if (scaleRule && camp.roasToday >= scaleRule.threshold && stockDays > 20) {
      return {
        campaignId: camp.id,
        campaignName: camp.name,
        platform: camp.platform,
        currentSpend: camp.spendToday,
        currentRoas: camp.roasToday,
        linkedStock: stockQty,
        riskLevel: 'SAFE',
        actionRecommended: 'SCALE_BUDGET',
        estimatedSavings: 0,
        message: {
          tr: `Mükemmel ROAS (${camp.roasToday}x) ve sağlıklı stok. Günlük bütçeyi %20 artırarak ölçekleyebilirsiniz.`,
          en: `Exceptional ROAS (${camp.roasToday}x) with healthy stock. Recommended to scale daily budget by 20%.`,
        },
      };
    }

    // Default Safe
    return {
      campaignId: camp.id,
      campaignName: camp.name,
      platform: camp.platform,
      currentSpend: camp.spendToday,
      currentRoas: camp.roasToday,
      linkedStock: stockQty,
      riskLevel: 'SAFE',
      actionRecommended: 'NONE',
      estimatedSavings: 0,
      message: {
        tr: 'Kampanya metrikleri belirlenen kalkan kuralları dahilinde sağlıklı.',
        en: 'Campaign is performing within normal safety thresholds.',
      },
    };
  });
}
