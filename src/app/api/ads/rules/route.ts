import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_SENTINEL_RULES, SentinelRule } from '@/lib/services/adSentinelEngine';

let currentRules: SentinelRule[] = [...DEFAULT_SENTINEL_RULES];

export async function GET() {
  return NextResponse.json({
    success: true,
    rules: currentRules,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { rules } = await request.json();
    if (Array.isArray(rules)) {
      currentRules = rules;
    }
    return NextResponse.json({
      success: true,
      rules: currentRules,
      message: 'Sentinel protection rules updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update rules' }, { status: 500 });
  }
}
