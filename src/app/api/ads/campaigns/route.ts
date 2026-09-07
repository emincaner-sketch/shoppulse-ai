import { NextResponse } from 'next/server';
import { MOCK_AD_CAMPAIGNS, MOCK_PRODUCTS } from '@/lib/data/mockStores';
import { auditAdCampaigns } from '@/lib/services/adSentinelEngine';

export async function GET() {
  try {
    const audits = auditAdCampaigns(MOCK_AD_CAMPAIGNS, MOCK_PRODUCTS);

    const campaignsWithAudit = MOCK_AD_CAMPAIGNS.map((camp) => {
      const audit = audits.find((a) => a.campaignId === camp.id);
      return {
        ...camp,
        audit,
      };
    });

    const totalProtectedSpend = audits.reduce((acc, a) => acc + a.estimatedSavings, 0);

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithAudit,
      totalProtectedSpend,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Campaign fetch failed' }, { status: 500 });
  }
}
