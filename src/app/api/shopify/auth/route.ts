import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop query parameter' }, { status: 400 });
  }

  // Shopify OAuth URL construction
  const clientId = process.env.SHOPIFY_CLIENT_ID || 'demo_client_id';
  const scopes = 'read_products,write_products,read_orders,read_inventory,read_analytics';
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/shopify/callback`;
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}`;

  return NextResponse.json({
    success: true,
    authUrl,
    shop,
    message: 'OAuth authorization URL generated successfully',
  });
}
