import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { campaignId, action } = await request.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }

    const newStatus = action === 'RESUME' ? 'ACTIVE' : 'PAUSED';
    const savedWasteToday = action === 'PAUSE' || action === 'THROTTLE' ? 85.4 : 0;

    return NextResponse.json({
      success: true,
      campaignId,
      status: newStatus,
      savedWasteToday,
      timestamp: new Date().toISOString(),
      message: `Campaign ${campaignId} ${newStatus === 'ACTIVE' ? 'resumed' : 'throttled/paused'} via Ad Spend Sentinel.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Toggle failed' }, { status: 500 });
  }
}
