import { NextRequest, NextResponse } from 'next/server';
import { runGrowthAnalysis, DEFAULT_NIGHTFOLD_CONTEXT } from '@/lib/gemini';
import { getCustomAppConfig, shopifyGraphQL, FETCH_PRODUCTS_QUERY, FETCH_SHOP_QUERY } from '@/lib/shopify-custom-app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { language = 'tr', customPrompt } = body;

    // Build store context directly from live Shopify API if configured
    let storeContext = { ...DEFAULT_NIGHTFOLD_CONTEXT };
    try {
      const config = getCustomAppConfig();
      if (config.accessToken || (config.clientId && config.clientSecret)) {
        const [productsRes, shopRes] = await Promise.allSettled([
          shopifyGraphQL(FETCH_PRODUCTS_QUERY, { first: 10 }, config),
          shopifyGraphQL(FETCH_SHOP_QUERY, {}, config),
        ]);

        if (productsRes.status === 'fulfilled' && productsRes.value?.data?.products?.edges?.length > 0) {
          const rawProd = productsRes.value.data.products.edges[0]?.node;
          if (rawProd) {
            let totalInv = rawProd.totalInventory ?? 0;
            if (!totalInv && rawProd.variants?.edges) {
              rawProd.variants.edges.forEach(({ node }: any) => {
                totalInv += node.inventoryQuantity || 0;
              });
            }
            const minPrice = parseFloat(rawProd.priceRangeV2?.minVariantPrice?.amount || '34.99');

            storeContext.mainProduct.title = rawProd.title;
            storeContext.mainProduct.price = minPrice;
            storeContext.mainProduct.inventory = totalInv || 36714;
          }
        }

        if (shopRes.status === 'fulfilled' && shopRes.value?.data?.shop?.name) {
          storeContext.storeName = shopRes.value.data.shop.name;
          storeContext.domain = shopRes.value.data.shop.myshopifyDomain || storeContext.domain;
          storeContext.currency = shopRes.value.data.shop.currencyCode || 'USD';
        }
      }
    } catch (e) {
      console.warn('[Growth Analyst] Live sync context enrichment warning:', e);
    }

    const result = await runGrowthAnalysis(storeContext, language);

    return NextResponse.json({
      success: true,
      ...result,
      store: {
        name: storeContext.storeName,
        domain: storeContext.domain,
        product: storeContext.mainProduct.title,
        price: storeContext.mainProduct.price,
        inventory: storeContext.mainProduct.inventory,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Growth Analyst API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Growth analysis generation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Support GET request for instant pre-flight check
  const searchParams = request.nextUrl.searchParams;
  const language = (searchParams.get('lang') || 'tr') as 'tr' | 'en';
  const result = await runGrowthAnalysis(DEFAULT_NIGHTFOLD_CONTEXT, language);
  return NextResponse.json({
    success: true,
    ...result,
    store: {
      name: DEFAULT_NIGHTFOLD_CONTEXT.storeName,
      domain: DEFAULT_NIGHTFOLD_CONTEXT.domain,
      product: DEFAULT_NIGHTFOLD_CONTEXT.mainProduct.title,
      price: DEFAULT_NIGHTFOLD_CONTEXT.mainProduct.price,
      inventory: DEFAULT_NIGHTFOLD_CONTEXT.mainProduct.inventory,
    },
    timestamp: new Date().toISOString(),
  });
}
