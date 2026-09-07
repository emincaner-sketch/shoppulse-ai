import { NextRequest, NextResponse } from 'next/server';
import { runCreativeStudioGeneration, DEFAULT_NIGHTFOLD_CONTEXT } from '@/lib/gemini';
import { getCustomAppConfig, shopifyGraphQL, FETCH_PRODUCTS_QUERY } from '@/lib/shopify-custom-app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { language = 'tr', customPrompt } = body;

    let productContext = { ...DEFAULT_NIGHTFOLD_CONTEXT.mainProduct };

    try {
      const config = getCustomAppConfig();
      if (config.accessToken || (config.clientId && config.clientSecret)) {
        const productsRes = await shopifyGraphQL(FETCH_PRODUCTS_QUERY, { first: 5 }, config);
        const edges = productsRes.data?.products?.edges || [];
        if (edges.length > 0) {
          const rawProd = edges[0]?.node;
          if (rawProd) {
            productContext.title = rawProd.title;
            productContext.price = parseFloat(rawProd.priceRangeV2?.minVariantPrice?.amount || '34.99');
          }
        }
      }
    } catch (e) {
      console.warn('[Creative Studio] Product context enrichment warning:', e);
    }

    const result = await runCreativeStudioGeneration(productContext, language);

    return NextResponse.json({
      success: true,
      ...result,
      product: {
        title: productContext.title,
        price: productContext.price,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Creative Studio API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Creative studio generation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = (searchParams.get('lang') || 'tr') as 'tr' | 'en';
  const result = await runCreativeStudioGeneration(DEFAULT_NIGHTFOLD_CONTEXT.mainProduct, language);
  return NextResponse.json({
    success: true,
    ...result,
    product: {
      title: DEFAULT_NIGHTFOLD_CONTEXT.mainProduct.title,
      price: DEFAULT_NIGHTFOLD_CONTEXT.mainProduct.price,
    },
    timestamp: new Date().toISOString(),
  });
}
