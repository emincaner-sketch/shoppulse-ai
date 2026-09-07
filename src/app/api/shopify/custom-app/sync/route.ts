import { NextRequest, NextResponse } from 'next/server';
import {
  shopifyGraphQL,
  FETCH_PRODUCTS_QUERY,
  FETCH_ORDERS_QUERY,
  getCustomAppConfig,
} from '@/lib/shopify-custom-app';

export async function GET(request: NextRequest) {
  const config = getCustomAppConfig();

  if (!config.accessToken) {
    return NextResponse.json({
      isLive: false,
      mode: 'private_custom_app_ready',
      message:
        'Shopify Admin API Token henüz .env dosyasına eklenmedi. Kendi tokenınızı (shpat_...) eklediğinizde canlı mağaza verileriniz otomatik yüklenecektir.',
      configuredDomain: config.storeDomain,
    });
  }

  try {
    // 1. Fetch live products from user's store
    const productsRes = await shopifyGraphQL(FETCH_PRODUCTS_QUERY, { first: 50 });
    const ordersRes = await shopifyGraphQL(FETCH_ORDERS_QUERY, { first: 100 });

    const rawProducts = productsRes.data?.products?.edges || [];
    const rawOrders = ordersRes.data?.orders?.edges || [];

    // Transform into ShopPulse format
    const products = rawProducts.map(({ node }: any) => {
      const minPrice = parseFloat(node.priceRangeV2?.minVariantPrice?.amount || '0');
      const totalInv = node.totalInventory ?? 0;
      return {
        id: node.id.split('/').pop(),
        shopifyProductId: node.id,
        title: node.title,
        handle: node.handle,
        retailPrice: minPrice,
        inventory: totalInv,
        imageUrl: node.featuredImage?.url || '/images/placeholder.jpg',
        category: node.productType || 'Apparel',
        vendor: node.vendor,
        status: totalInv < 10 ? 'ZOMBIE_DOG' : minPrice > 100 ? 'STAR' : 'CASH_COW',
        grossMarginPct: 42.5,
        score: Math.min(99, Math.max(40, Math.round(minPrice * 0.4 + totalInv * 0.2))),
      };
    });

    // Calculate aggregated revenue from live orders
    let totalSales = 0;
    rawOrders.forEach(({ node }: any) => {
      totalSales += parseFloat(node.totalPriceSet?.shopMoney?.amount || '0');
    });

    return NextResponse.json({
      isLive: true,
      mode: 'private_custom_app_live',
      storeDomain: config.storeDomain,
      productsCount: products.length,
      ordersCount: rawOrders.length,
      totalSalesEstimate: Math.round(totalSales),
      products: products.slice(0, 20),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        isLive: false,
        error: error.message || 'Failed to sync private Shopify store',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const customConfig = {
      storeDomain: body.storeDomain || process.env.SHOPIFY_STORE_DOMAIN,
      accessToken: body.accessToken || process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
    };

    if (!customConfig.accessToken || !customConfig.storeDomain) {
      return NextResponse.json(
        {
          isLive: false,
          error: 'Lütfen Mağaza Alan Adı (Store Domain) ve Admin API Access Token (shpat_...) girin veya .env dosyasına tanımlayın.',
        },
        { status: 400 }
      );
    }

    const cleanDomain = customConfig.storeDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .toLowerCase();

    // 1. Fetch live products from user's store
    const productsRes = await shopifyGraphQL(
      FETCH_PRODUCTS_QUERY,
      { first: 50 },
      { storeDomain: cleanDomain, accessToken: customConfig.accessToken }
    );

    if (productsRes.errors && productsRes.errors.length > 0) {
      return NextResponse.json(
        {
          isLive: false,
          error: productsRes.errors[0]?.message || 'Shopify API bağlantı hatası',
        },
        { status: 401 }
      );
    }

    const ordersRes = await shopifyGraphQL(
      FETCH_ORDERS_QUERY,
      { first: 100 },
      { storeDomain: cleanDomain, accessToken: customConfig.accessToken }
    );

    const rawProducts = productsRes.data?.products?.edges || [];
    const rawOrders = ordersRes.data?.orders?.edges || [];

    const products = rawProducts.map(({ node }: any) => {
      const minPrice = parseFloat(node.priceRangeV2?.minVariantPrice?.amount || '0');
      const totalInv = node.totalInventory ?? 0;
      return {
        id: node.id.split('/').pop(),
        shopifyProductId: node.id,
        title: node.title,
        handle: node.handle,
        retailPrice: minPrice,
        inventory: totalInv,
        imageUrl: node.featuredImage?.url || '/images/placeholder.jpg',
        category: node.productType || 'Apparel',
        vendor: node.vendor,
        status: totalInv < 10 ? 'ZOMBIE_DOG' : minPrice > 100 ? 'STAR' : 'CASH_COW',
        grossMarginPct: 42.5,
        score: Math.min(99, Math.max(40, Math.round(minPrice * 0.4 + totalInv * 0.2))),
      };
    });

    let totalSales = 0;
    rawOrders.forEach(({ node }: any) => {
      totalSales += parseFloat(node.totalPriceSet?.shopMoney?.amount || '0');
    });

    return NextResponse.json({
      isLive: true,
      mode: 'private_custom_app_live',
      storeDomain: cleanDomain,
      productsCount: products.length,
      ordersCount: rawOrders.length,
      totalSalesEstimate: Math.round(totalSales),
      products: products.slice(0, 20),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        isLive: false,
        error: error.message || 'Failed to sync private Shopify store',
      },
      { status: 500 }
    );
  }
}

