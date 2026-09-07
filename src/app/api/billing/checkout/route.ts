import { NextRequest, NextResponse } from 'next/server';

interface CheckoutRequestBody {
  planTier: 'GROWTH_PRO' | 'SCALE_ENTERPRISE';
  interval?: 'monthly' | 'yearly';
  userId?: string;
  storeId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

const STRIPE_PRICING = {
  GROWTH_PRO: {
    name: 'ShopPulse AI — Growth Pro',
    monthlyPrice: 49,
    yearlyPrice: 470, // ~20% discount ($39/mo)
  },
  SCALE_ENTERPRISE: {
    name: 'ShopPulse AI — Scale Enterprise',
    monthlyPrice: 129,
    yearlyPrice: 1240, // ~20% discount ($103/mo)
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const {
      planTier,
      interval = 'monthly',
      userId = 'user-demo',
      storeId = 'store-1',
      successUrl,
      cancelUrl,
    } = body;

    if (!planTier || !STRIPE_PRICING[planTier]) {
      return NextResponse.json({ error: 'Invalid planTier specified' }, { status: 400 });
    }

    const plan = STRIPE_PRICING[planTier];
    const amount = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    const sessionId = `cs_test_${Math.random().toString(36).substring(2)}${Date.now()}`;

    // Return realistic checkout session details
    return NextResponse.json({
      success: true,
      provider: 'STRIPE',
      sessionId,
      planTier,
      billingInterval: interval,
      amountUsd: amount,
      currency: 'USD',
      checkoutUrl: `/checkout/mock-stripe?session_id=${sessionId}&tier=${planTier}&interval=${interval}`,
      metadata: {
        userId,
        storeId,
        productName: plan.name,
        successUrl: successUrl || '/?billing_status=success',
        cancelUrl: cancelUrl || '/?billing_status=cancelled',
      },
      message: 'Stripe Checkout Session initialized successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Stripe checkout initialization failed' },
      { status: 500 }
    );
  }
}
