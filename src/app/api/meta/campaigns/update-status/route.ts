import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      adsetId,
      status, // 'ACTIVE' | 'PAUSED'
      action, // 'PAUSE' | 'RESUME' | 'THROTTLE'
      accessToken: clientToken,
    } = body;

    // Normalize status
    let targetStatus: 'ACTIVE' | 'PAUSED' = 'ACTIVE';
    if (status) {
      targetStatus = status.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'PAUSED';
    } else if (action) {
      targetStatus = action.toUpperCase() === 'RESUME' ? 'ACTIVE' : 'PAUSED';
    }

    const targetNodeId = adsetId || campaignId;
    if (!targetNodeId) {
      return NextResponse.json(
        { success: false, error: 'campaignId veya adsetId zorunludur.' },
        { status: 400 }
      );
    }

    const token = clientToken || process.env.META_ACCESS_TOKEN;
    const isPlaceholder = !token || token === 'EAAxxxxxxx_your_meta_system_user_access_token_here';

    // If no live token provided, return simulated update
    if (isPlaceholder) {
      return NextResponse.json({
        success: true,
        isDemo: true,
        campaignId,
        adsetId,
        status: targetStatus,
        message: `[Simülasyon Modu] Kampanya durumu "${targetStatus === 'ACTIVE' ? 'AKTİF' : 'DURAKLATILDI'}" olarak güncellendi.`,
      });
    }

    // Call Meta Marketing Graph API
    const metaApiUrl = `https://graph.facebook.com/v21.0/${targetNodeId}`;
    const formData = new URLSearchParams();
    formData.append('status', targetStatus);
    formData.append('access_token', token);

    const res = await fetch(metaApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && (data.success === true || !!data.id)) {
      return NextResponse.json({
        success: true,
        campaignId,
        adsetId,
        status: targetStatus,
        message: `Meta API: Kampanya durumu "${targetStatus === 'ACTIVE' ? 'AKTİF' : 'DURAKLATILDI'}" olarak güncellendi.`,
      });
    }

    // If direct node update failed and this was campaignId, try adset if available
    if (campaignId && adsetId && targetNodeId === campaignId) {
      const fallbackUrl = `https://graph.facebook.com/v21.0/${adsetId}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const fallbackData = await fallbackRes.json().catch(() => ({}));
      if (fallbackRes.ok && (fallbackData.success === true || !!fallbackData.id)) {
        return NextResponse.json({
          success: true,
          level: 'ADSET',
          campaignId,
          adsetId,
          status: targetStatus,
          message: `Meta API: Reklam seti düzeyi "${targetStatus === 'ACTIVE' ? 'AKTİF' : 'DURAKLATILDI'}" olarak güncellendi.`,
        });
      }
    }

    const errorMessage = data?.error?.message || 'Meta API durum güncellemesini reddetti.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Meta Update Status API Fatal Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Durum güncellenirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
