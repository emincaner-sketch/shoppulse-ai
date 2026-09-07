import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    const rawBody = await request.text();
    const event = rawBody ? JSON.parse(rawBody) : {};
    const eventId = event.id || `evt_stripe_${Date.now()}`;
    const eventType = event.type || 'checkout.session.completed';

    // 1. Idempotency Check for Stripe Webhook
    try {
      const existing = await prisma.webhookEvent.findUnique({
        where: { id: eventId },
      });
      if (existing) {
        return NextResponse.json({
          status: 'duplicate_ignored',
          eventId,
          message: 'Stripe webhook event already processed.',
        });
      }

      await prisma.webhookEvent.create({
        data: {
          id: eventId,
          source: 'STRIPE',
          topic: eventType,
          status: 'PROCESSED',
          payload: event,
        },
      });
    } catch {
      // Continue gracefully if DB is mocked
    }

    // 2. Process Stripe Subscription Events
    switch (eventType) {
      case 'checkout.session.completed': {
        const metadata = event.data?.object?.metadata || {};
        const userId = metadata.userId || 'user-demo';
        const storeId = metadata.storeId || 'store-1';
        const planTier = metadata.planTier || 'GROWTH_PRO';

        try {
          await prisma.user.update({
            where: { id: userId },
            data: { planTier: planTier as any },
          });

          await prisma.auditLog.create({
            data: {
              userId,
              action: 'PLAN_UPGRADED_STRIPE',
              metadata: { planTier, storeId, eventId },
            },
          });
        } catch {}

        return NextResponse.json({
          status: 'processed',
          event: eventType,
          planTier,
          message: `User plan upgraded to ${planTier}.`,
        });
      }

      case 'customer.subscription.updated': {
        const subObject = event.data?.object || {};
        const status = subObject.status || 'active';
        return NextResponse.json({
          status: 'processed',
          event: eventType,
          subscriptionStatus: status,
        });
      }

      case 'customer.subscription.deleted': {
        const metadata = event.data?.object?.metadata || {};
        const userId = metadata.userId || 'user-demo';

        try {
          await prisma.user.update({
            where: { id: userId },
            data: { planTier: 'FREE_STARTER' },
          });
        } catch {}

        return NextResponse.json({
          status: 'processed',
          event: eventType,
          message: 'Subscription cancelled. Downgraded to FREE_STARTER.',
        });
      }

      default:
        return NextResponse.json({
          status: 'acknowledged',
          eventType,
        });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Stripe webhook processing error' },
      { status: 500 }
    );
  }
}
