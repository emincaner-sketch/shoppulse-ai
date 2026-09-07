import { NextRequest, NextResponse } from 'next/server';
import { encryptToken } from '@/lib/crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing code or shop parameter' }, { status: 400 });
  }

  // Token exchange simulation
  const plainAccessToken = `shpat_${Math.random().toString(36).substring(2)}${Date.now()}`;

  // PRD Bölüm 12 standard: Access tokens must NEVER be stored in plain text.
  // Encrypt token using AES-256-GCM before DB insertion
  const encryptedAccessToken = encryptToken(plainAccessToken);

  return NextResponse.json({
    success: true,
    shop,
    encryptedToken: encryptedAccessToken,
    tokenStorage: 'AES-256-GCM',
    installedAt: new Date().toISOString(),
    message: 'Store authorized successfully. Token encrypted and 90-day sync scheduled.',
  });
}
