import { NextResponse } from 'next/server';
import { MOCK_COMPETITORS, MOCK_PRODUCTS } from '@/lib/data/mockStores';
import {
  detectArbitrageOpportunities,
  getMetaAdSpyInsights,
} from '@/lib/services/competitorIntelligenceEngine';

export async function GET() {
  try {
    const arbitrageAlerts = detectArbitrageOpportunities(MOCK_COMPETITORS, MOCK_PRODUCTS);
    const adSpyInsights = MOCK_COMPETITORS.map((c) => getMetaAdSpyInsights(c.domain));

    return NextResponse.json({
      success: true,
      competitors: MOCK_COMPETITORS,
      arbitrageAlerts,
      adSpyInsights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Radar analysis failed' }, { status: 500 });
  }
}
