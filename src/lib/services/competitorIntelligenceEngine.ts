import { CompetitorStore, Product } from '@/types';

export interface CompetitorArbitrageAlert {
  competitorName: string;
  competitorProductTitle: string;
  competitorPrice: number;
  myProductTitle: string;
  myPrice: number;
  potentialPriceIncrease: number;
  grossMarginLiftEstimate: string;
  type: 'COMPETITOR_STOCKOUT_ARBITRAGE' | 'PRICE_UNDERCUT_OPPORTUNITY' | 'NEW_PRODUCT_RADAR';
  urgency: 'HIGH' | 'MEDIUM';
  message: {
    tr: string;
    en: string;
  };
}

export interface MetaAdSpyInsight {
  competitorDomain: string;
  totalActiveAds: number;
  longestRunningAdDays: number;
  formatBreakdown: {
    videoPct: number;
    carouselPct: number;
    imagePct: number;
  };
  keyAdHooks: string[];
}

export function detectArbitrageOpportunities(
  competitors: CompetitorStore[],
  myProducts: Product[]
): CompetitorArbitrageAlert[] {
  const alerts: CompetitorArbitrageAlert[] = [];

  for (const comp of competitors) {
    for (const compProduct of comp.topSellingProducts) {
      // Find similar product in our store
      const myMatch = myProducts.find((p) =>
        p.title.toLowerCase().includes('bot') && compProduct.title.toLowerCase().includes('boot') ||
        p.title.toLowerCase().includes('hırka') && compProduct.title.toLowerCase().includes('cardigan') ||
        p.title.toLowerCase().includes('çanta') && compProduct.title.toLowerCase().includes('bag')
      );

      if (myMatch) {
        // Case 1: Competitor Stockout Arbitrage
        if (compProduct.status === 'out_of_stock' && myMatch.inventory > 10) {
          const suggestedIncrease = Math.round(compProduct.price - myMatch.retailPrice);
          alerts.push({
            competitorName: comp.brandName,
            competitorProductTitle: compProduct.title,
            competitorPrice: compProduct.price,
            myProductTitle: myMatch.title,
            myPrice: myMatch.retailPrice,
            potentialPriceIncrease: Math.max(5, suggestedIncrease),
            grossMarginLiftEstimate: `+$${Math.round(myMatch.velocity30Days * 30 * 10)} / Ay`,
            type: 'COMPETITOR_STOCKOUT_ARBITRAGE',
            urgency: 'HIGH',
            message: {
              tr: `${comp.brandName} mağazasında "${compProduct.title}" tükendi! Sizde ${myMatch.inventory} adet stok var. Fiyatı $${myMatch.retailPrice}'den $${myMatch.retailPrice + 10}'a çıkarıp reklamda "Aynı Gün Teslim" vurgusu yapın.`,
              en: `Stockout at ${comp.brandName} for "${compProduct.title}"! You hold ${myMatch.inventory} units. Lift price from $${myMatch.retailPrice} to $${myMatch.retailPrice + 10} and highlight express shipping in ad copy.`,
            },
          });
        }
        // Case 2: Price Disparity
        else if (compProduct.price > myMatch.retailPrice + 8) {
          alerts.push({
            competitorName: comp.brandName,
            competitorProductTitle: compProduct.title,
            competitorPrice: compProduct.price,
            myProductTitle: myMatch.title,
            myPrice: myMatch.retailPrice,
            potentialPriceIncrease: compProduct.price - myMatch.retailPrice,
            grossMarginLiftEstimate: '+%8 Brüt Marj',
            type: 'PRICE_UNDERCUT_OPPORTUNITY',
            urgency: 'MEDIUM',
            message: {
              tr: `Rakip benzer ürünü $${compProduct.price}'dan satıyor. Fiyatınızı $${myMatch.retailPrice + 5}'a çekerek karınızı artırabilirsiniz.`,
              en: `Competitor lists similar item at $${compProduct.price}. You can comfortably lift to $${myMatch.retailPrice + 5} without conversion drag.`,
            },
          });
        }
      }
    }
  }

  return alerts;
}

export function getMetaAdSpyInsights(competitorDomain: string): MetaAdSpyInsight {
  return {
    competitorDomain,
    totalActiveAds: 19,
    longestRunningAdDays: 48, // 48 gündür yayında olan kreatif = kanıtlanmış kazanan (winner ad)
    formatBreakdown: {
      videoPct: 65, // %65 UGC Video
      carouselPct: 25,
      imagePct: 10,
    },
    keyAdHooks: [
      'Problem-Çözüm: Kaşındırmayan kumaş garantisi',
      'Sosyal Kanıt: 1.200+ 5 Yıldızlı Müşteri Yorumu',
      'Fırsat Teklifi: 2. Ürüne %30 İndirim Kodu',
    ],
  };
}
