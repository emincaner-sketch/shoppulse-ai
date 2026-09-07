export interface StoreHealthInput {
  conversionRate: number; // e.g. 3.2%
  blendedRoas: number; // e.g. 3.42x
  deadStockRatio: number; // e.g. 0.15 (%15 ölü stok)
  avgDaysInventory: number; // e.g. 45 days
  repeatCustomerRate: number; // e.g. 0.28 (%28)
}

export interface HealthScoreBreakdown {
  totalScore: number; // 0-100
  pillars: {
    conversionScore: number; // 0-25
    marketingScore: number; // 0-25
    inventoryScore: number; // 0-25
    retentionScore: number; // 0-25
  };
  grade: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL';
  primaryBottleneck: string;
}

export function computeStoreHealthScore(input: StoreHealthInput): HealthScoreBreakdown {
  // 1. Conversion Pillar (Target: >= 3.5%)
  const conversionScore = Math.min(25, Math.round((input.conversionRate / 3.5) * 25));

  // 2. Marketing Pillar (Target: >= 3.5x ROAS)
  const marketingScore = Math.min(25, Math.round((input.blendedRoas / 3.5) * 25));

  // 3. Inventory Health Pillar (Lower dead stock & balanced days)
  let inventoryScore = 25;
  if (input.deadStockRatio > 0.25) inventoryScore -= 10;
  else if (input.deadStockRatio > 0.1) inventoryScore -= 5;
  if (input.avgDaysInventory > 90) inventoryScore -= 8;
  inventoryScore = Math.max(5, inventoryScore);

  // 4. Retention & Customer Loyalty Pillar (Target: >= 30%)
  const retentionScore = Math.min(25, Math.round((input.repeatCustomerRate / 0.3) * 25));

  const totalScore = Math.max(15, Math.min(99, conversionScore + marketingScore + inventoryScore + retentionScore));

  let grade: HealthScoreBreakdown['grade'] = 'GOOD';
  if (totalScore >= 85) grade = 'EXCELLENT';
  else if (totalScore >= 70) grade = 'GOOD';
  else if (totalScore >= 50) grade = 'NEEDS_WORK';
  else grade = 'CRITICAL';

  let primaryBottleneck = 'Genel operasyon dengeli.';
  if (inventoryScore < 15) {
    primaryBottleneck = 'Ölü stok oranı yüksek, sermaye tasfiyesi gerekiyor.';
  } else if (marketingScore < 15) {
    primaryBottleneck = 'Harmanlanmış ROAS hedefin altında, karsız reklamları kapatın.';
  } else if (conversionScore < 15) {
    primaryBottleneck = 'Dönüşüm oranı sektör ortalamasının altında, ürün sayfalarını optimize edin.';
  }

  return {
    totalScore,
    pillars: {
      conversionScore,
      marketingScore,
      inventoryScore,
      retentionScore,
    },
    grade,
    primaryBottleneck,
  };
}
