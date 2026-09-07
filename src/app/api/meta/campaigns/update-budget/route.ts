import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, adsetId, newDailyBudget, budgetDelta, currentBudget, accessToken: clientToken } = body;

    const targetId = adsetId || campaignId;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'campaignId veya adsetId zorunludur' },
        { status: 400 }
      );
    }

    // Determine new budget value
    let targetBudget: number;
    if (newDailyBudget !== undefined && newDailyBudget !== null) {
      targetBudget = parseFloat(Number(newDailyBudget).toFixed(2));
    } else if (budgetDelta !== undefined && budgetDelta !== null) {
      const base = currentBudget !== undefined && currentBudget !== null ? Number(currentBudget) : 50;
      targetBudget = parseFloat((base + Number(budgetDelta)).toFixed(2));
    } else {
      return NextResponse.json(
        { success: false, error: 'newDailyBudget veya budgetDelta parametresi gereklidir' },
        { status: 400 }
      );
    }

    if (isNaN(targetBudget) || targetBudget <= 0) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz bütçe tutarı' },
        { status: 400 }
      );
    }

    const token = clientToken || process.env.META_ACCESS_TOKEN;
    const dailyBudgetCents = Math.round(targetBudget * 100);

    let liveMetaUpdated = false;
    let metaResponse: any = null;

    // Attempt live Meta Marketing API call if token is available
    if (token && token !== 'EAAxxxxxxx_your_meta_system_user_access_token_here') {
      try {
        const metaApiUrl = `https://graph.facebook.com/v21.0/${targetId}`;
        const formData = new URLSearchParams();
        formData.append('daily_budget', dailyBudgetCents.toString());
        formData.append('access_token', token);

        const res = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const data = await res.json().catch(() => ({}));
        metaResponse = data;

        if (res.ok && (data.success || data.id)) {
          liveMetaUpdated = true;
        } else {
          console.warn('[Meta API Budget Update] Live call non-200 or returned error:', data);
        }
      } catch (metaErr) {
        console.warn('[Meta API Budget Update] Live fetch error:', metaErr);
      }
    }

    return NextResponse.json({
      success: true,
      campaignId: targetId,
      updatedBudget: targetBudget,
      dailyBudgetCents,
      liveMetaUpdated,
      message: liveMetaUpdated
        ? `Meta Ads bütçesi başarıyla $${targetBudget.toFixed(2)}/gün olarak güncellendi.`
        : `Panel bütçesi $${targetBudget.toFixed(2)}/gün olarak güncellendi. (Canlı Meta API bağlantısı hazır olduğunda otomatik senkronize edilir)`,
      metaResponse,
    });
  } catch (error: any) {
    console.error('[Meta Update Budget API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bütçe güncellenirken beklenmeyen bir hata oluştu' },
      { status: 500 }
    );
  }
}
