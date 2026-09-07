import { ProductStatus } from '@/types';

export interface ProductMetricInput {
  title: string;
  retailPrice: number;
  costPrice: number;
  inventory: number;
  velocity30Days: number; // units/day
  conversionRate: number; // %
}

export interface BCGAnalysisResult {
  status: ProductStatus;
  score: number; // 0-100
  daysOfInventory: number;
  grossMarginPct: number;
  rationale: string;
}

export function analyzeProductBCG(input: ProductMetricInput): BCGAnalysisResult {
  const marginDollar = input.retailPrice - input.costPrice;
  const grossMarginPct = input.retailPrice > 0 ? (marginDollar / input.retailPrice) * 100 : 0;
  const daysOfInventory =
    input.velocity30Days > 0 ? Math.round(input.inventory / input.velocity30Days) : 999;

  let status: ProductStatus = 'QUESTION_MARK';
  let rationale = '';

  // BCG Classification Logic
  if (input.velocity30Days >= 3.5 && grossMarginPct >= 55) {
    status = 'STAR';
    rationale = `Yüksek satış hızı (${input.velocity30Days} adet/gün) ve %${grossMarginPct.toFixed(1)} kar marjı ile mağazanın amiral gemisi.`;
  } else if (input.velocity30Days >= 2.0 && grossMarginPct >= 45) {
    status = 'CASH_COW';
    rationale = `İstikrarlı nakit akışı sağlayan sadık müşteri favorisi. Sepet ortalamasını artırmak için çapraz satış önerilir.`;
  } else if (input.velocity30Days < 0.8 && daysOfInventory > 90) {
    status = 'ZOMBIE_DOG';
    rationale = `${daysOfInventory} gündür satmayan ve sermaye bağlayan ürün. %25+ indirim veya bundle ile nakite dönüştürülmeli.`;
  } else {
    status = 'QUESTION_MARK';
    rationale = `Dönüşüm oranı (%${input.conversionRate}) optimize edilirse 'Star' kategorisine geçme potansiyeli yüksek.`;
  }

  // Composite Score (0-100)
  const velocityScore = Math.min(40, input.velocity30Days * 8); // max 40
  const marginScore = Math.min(30, (grossMarginPct / 100) * 30); // max 30
  const convScore = Math.min(20, input.conversionRate * 5); // max 20
  const stockPenalty = daysOfInventory > 120 ? -15 : daysOfInventory < 4 ? -5 : 10;

  const score = Math.max(10, Math.min(99, Math.round(velocityScore + marginScore + convScore + stockPenalty)));

  return {
    status,
    score,
    daysOfInventory,
    grossMarginPct,
    rationale,
  };
}
