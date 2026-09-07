import { NextRequest, NextResponse } from 'next/server';
import { MOCK_BENCHMARKS } from '@/lib/data/mockStores';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'Fashion & Apparel';

    return NextResponse.json({
      success: true,
      category,
      verifiedStoreSampleCount: 428,
      lastUpdatedMonth: '2026-08',
      benchmarks: MOCK_BENCHMARKS,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch benchmarks' }, { status: 500 });
  }
}
