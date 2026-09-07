import { NextRequest, NextResponse } from 'next/server';

interface MetaInsight {
  spend?: string;
  cpc?: string;
  ctr?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
}

export async function GET(request: NextRequest) {
  // Support query-param overrides (from localStorage-backed client calls)
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token') || process.env.META_ACCESS_TOKEN;
  const adAccountId = searchParams.get('adAccountId') || process.env.META_AD_ACCOUNT_ID;

  if (!token || !adAccountId || token === 'EAAxxxxxxx_your_meta_system_user_access_token_here') {
    return NextResponse.json({
      isConnected: false,
      message: 'Meta Ads bağlantısı henüz yapılmadı. Reklam verilerini analiz etmek için Meta Business hesabınızı bağlayın.',
      campaigns: [],
      stats: {
        totalSpend: 0,
        blendedRoas: 0,
        averageCpc: 0,
        averageCtr: 0,
      },
    });
  }

  // Normalize act_ prefix
  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

  try {
    const metaUrl = `https://graph.facebook.com/v21.0/${formattedAccountId}/campaigns?fields=id,name,status,daily_budget,budget_remaining,insights{spend,actions,clicks,cpc,ctr,action_values}&access_token=${token}`;

    const res = await fetch(metaUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const rawCampaigns = data.data || [];

      // Process campaigns, inspecting adsets if daily_budget is not on campaign level
      const campaigns = await Promise.all(
        rawCampaigns.map(async (c: any) => {
          const insight: MetaInsight = c.insights?.data?.[0] || {};
          let dailyBudget = c.daily_budget ? parseFloat((Number(c.daily_budget) / 100).toFixed(2)) : 0;
          let adsetId: string | undefined = undefined;

          // If daily_budget is missing at campaign level, inspect ad sets
          if (!dailyBudget || dailyBudget === 0) {
            try {
              const adsetsRes = await fetch(
                `https://graph.facebook.com/v21.0/${c.id}/adsets?fields=id,name,status,daily_budget&access_token=${token}`,
                { cache: 'no-store' }
              );
              if (adsetsRes.ok) {
                const adsetsData = await adsetsRes.json();
                const adsets = adsetsData.data || [];
                const activeAdset = adsets.find((a: any) => a.status === 'ACTIVE') || adsets[0];
                if (activeAdset) {
                  adsetId = activeAdset.id;
                  if (activeAdset.daily_budget) {
                    dailyBudget = parseFloat((Number(activeAdset.daily_budget) / 100).toFixed(2));
                  }
                }
              }
            } catch (adsetErr) {
              console.warn(`[Meta API] Failed to fetch adsets for campaign ${c.id}:`, adsetErr);
            }
          }

          const spendToday = parseFloat(insight.spend || '0');
          const cpc = parseFloat(insight.cpc || '0');
          const ctr = parseFloat(insight.ctr || '0');

          // Compute ROAS if purchase value exists
          let roasToday = 0;
          if (insight.action_values && Array.isArray(insight.action_values)) {
            const purchaseValue = insight.action_values.find(
              (av) => av.action_type === 'purchase' || av.action_type === 'omni_purchase'
            );
            if (purchaseValue && spendToday > 0) {
              roasToday = parseFloat((parseFloat(purchaseValue.value) / spendToday).toFixed(2));
            }
          }

          return {
            id: String(c.id), // Real Meta Campaign ID
            adsetId,
            platform: 'META',
            name: c.name,
            status: c.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
            dailyBudget: dailyBudget > 0 ? dailyBudget : 45.0,
            spendToday,
            roasToday,
            ctr,
            cpc,
            linkedProductName: 'Nightfold DeepRest 3D Sleep Mask',
            linkedProductStock: 36714,
            hasWarning: false,
          };
        })
      );

      const totalSpend = campaigns.reduce((acc: number, c: any) => acc + c.spendToday, 0);

      return NextResponse.json({
        isConnected: true,
        adAccountId: formattedAccountId,
        campaigns,
        stats: {
          totalSpend,
          activeCount: campaigns.filter((c: any) => c.status === 'ACTIVE').length,
          totalCount: campaigns.length,
        },
      });
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn('[Meta API] Live fetch error status:', res.status, errData);
      return NextResponse.json(
        {
          isConnected: false,
          error: errData?.error?.message || 'Meta API kampanyaları getirilemedi.',
          campaigns: [],
        },
        { status: res.status }
      );
    }
  } catch (err: any) {
    console.error('[Meta API] Live fetch exception:', err);
    return NextResponse.json(
      { isConnected: false, error: err.message, campaigns: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, adAccountId } = body;

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { success: false, error: 'Token and Ad Account ID are required' },
        { status: 400 }
      );
    }

    // Normalize act_ prefix
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

    // Verify credentials
    const verifyUrl = `https://graph.facebook.com/v21.0/${formattedAccountId}?fields=name,account_status&access_token=${accessToken}`;
    const verifyRes = await fetch(verifyUrl, { cache: 'no-store' });

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({}));
      const metaError = errData?.error?.message || 'Meta API doğrulama başarısız oldu.';
      return NextResponse.json(
        { success: false, error: metaError },
        { status: 400 }
      );
    }

    // Fetch actual campaigns with provided credentials
    const campaignsUrl = `https://graph.facebook.com/v21.0/${formattedAccountId}/campaigns?fields=id,name,status,daily_budget,insights{spend,actions,clicks,cpc,ctr}&access_token=${accessToken}`;
    const campRes = await fetch(campaignsUrl, { cache: 'no-store' });

    let campaigns: any[] = [];
    if (campRes.ok) {
      const campData = await campRes.json();
      const rawCampaigns = campData.data || [];

      campaigns = await Promise.all(
        rawCampaigns.map(async (c: any) => {
          const insight = c.insights?.data?.[0] || {};
          let dailyBudget = c.daily_budget ? parseFloat((Number(c.daily_budget) / 100).toFixed(2)) : 0;
          let adsetId: string | undefined = undefined;

          if (!dailyBudget || dailyBudget === 0) {
            try {
              const adsetsRes = await fetch(
                `https://graph.facebook.com/v21.0/${c.id}/adsets?fields=id,name,status,daily_budget&access_token=${accessToken}`,
                { cache: 'no-store' }
              );
              if (adsetsRes.ok) {
                const adsetsData = await adsetsRes.json();
                const activeAdset = (adsetsData.data || []).find((a: any) => a.status === 'ACTIVE') || (adsetsData.data || [])[0];
                if (activeAdset) {
                  adsetId = activeAdset.id;
                  if (activeAdset.daily_budget) {
                    dailyBudget = parseFloat((Number(activeAdset.daily_budget) / 100).toFixed(2));
                  }
                }
              }
            } catch {}
          }

          return {
            id: String(c.id),
            adsetId,
            platform: 'META',
            name: c.name,
            status: c.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
            dailyBudget: dailyBudget > 0 ? dailyBudget : 45.0,
            spendToday: parseFloat(insight.spend || '0'),
            roasToday: 0,
            ctr: parseFloat(insight.ctr || '0'),
            cpc: parseFloat(insight.cpc || '0'),
            linkedProductName: 'Nightfold DeepRest 3D Sleep Mask',
            linkedProductStock: 36714,
            hasWarning: false,
          };
        })
      );
    }

    return NextResponse.json({
      success: true,
      isConnected: true,
      message: 'Meta Marketing API başarıyla bağlandı',
      adAccountId: formattedAccountId,
      campaigns,
      campaignsCount: campaigns.length,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
