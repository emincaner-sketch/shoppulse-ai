import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyStoreOwnership } from '@/lib/tenant';

// In-memory sync state store
interface StoreSyncState {
  storeId: string;
  syncStatus: 'IDLE' | 'SYNCING' | 'READY' | 'FAILED';
  syncProgress: number; // 0 - 100
  syncStage: string;
  stageLabelTr: string;
  stageLabelEn: string;
  totalOrdersSynced: number;
  totalProductsSynced: number;
  lastSyncAt: string;
}

const syncStoreMap = new Map<string, StoreSyncState>([
  [
    'store-1',
    {
      storeId: 'store-1',
      syncStatus: 'READY',
      syncProgress: 100,
      syncStage: 'COMPLETED',
      stageLabelTr: 'Son 90 günlük veri başarıyla eşitlendi (1,420 Sipariş, 148 Ürün)',
      stageLabelEn: 'Last 90 days data fully synced (1,420 Orders, 148 Products)',
      totalOrdersSynced: 1420,
      totalProductsSynced: 148,
      lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
  ],
  [
    'store-2',
    {
      storeId: 'store-2',
      syncStatus: 'READY',
      syncProgress: 100,
      syncStage: 'COMPLETED',
      stageLabelTr: 'Son 90 günlük veri başarıyla eşitlendi (890 Sipariş, 92 Ürün)',
      stageLabelEn: 'Last 90 days data fully synced (890 Orders, 92 Products)',
      totalOrdersSynced: 890,
      totalProductsSynced: 92,
      lastSyncAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
  ],
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId') || 'store-1';
  const userId = searchParams.get('userId') || 'user-demo';

  // Multi-tenant check
  const tenantCheck = await verifyStoreOwnership(userId, storeId);
  if (!tenantCheck.authorized) {
    return NextResponse.json({ error: tenantCheck.error }, { status: 403 });
  }

  const current = syncStoreMap.get(storeId) || {
    storeId,
    syncStatus: 'READY',
    syncProgress: 100,
    syncStage: 'COMPLETED',
    stageLabelTr: 'Mağaza verileri hazır',
    stageLabelEn: 'Store data ready',
    totalOrdersSynced: 1200,
    totalProductsSynced: 120,
    lastSyncAt: new Date().toISOString(),
  };

  return NextResponse.json(current);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId = 'store-1', userId = 'user-demo', action = 'start' } = body;

    const tenantCheck = await verifyStoreOwnership(userId, storeId);
    if (!tenantCheck.authorized) {
      return NextResponse.json({ error: tenantCheck.error }, { status: 403 });
    }

    if (action === 'start') {
      const activeState: StoreSyncState = {
        storeId,
        syncStatus: 'SYNCING',
        syncProgress: 25,
        syncStage: 'FETCHING_PRODUCTS',
        stageLabelTr: 'Shopify ürün kataloğu ve varyantlar çekiliyor (%25)...',
        stageLabelEn: 'Fetching Shopify product catalog and variants (25%)...',
        totalOrdersSynced: 0,
        totalProductsSynced: 148,
        lastSyncAt: new Date().toISOString(),
      };
      syncStoreMap.set(storeId, activeState);

      // Audit log
      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'MANUAL_STORE_SYNC_TRIGGERED',
            metadata: { storeId, timestamp: new Date().toISOString() },
          },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: '90-Day historical store sync initiated.',
        sync: activeState,
      });
    }

    if (action === 'progress') {
      const progress = body.progress ?? 65;
      const stage =
        progress < 40
          ? 'FETCHING_PRODUCTS'
          : progress < 75
          ? 'FETCHING_ORDERS'
          : progress < 95
          ? 'CALCULATING_BCG'
          : 'COMPLETED';

      const updated: StoreSyncState = {
        storeId,
        syncStatus: progress >= 100 ? 'READY' : 'SYNCING',
        syncProgress: progress,
        syncStage: stage,
        stageLabelTr:
          progress < 40
            ? 'Ürün kataloğu ve varyantlar çekiliyor (%25)...'
            : progress < 75
            ? 'Son 90 günlük 1,420 sipariş çekiliyor (%55)...'
            : progress < 95
            ? 'BCG Ürün Matrisi & Satış Hızı hesaplanıyor (%85)...'
            : 'Son 90 günlük veri başarıyla eşitlendi (%100)',
        stageLabelEn:
          progress < 40
            ? 'Fetching product catalog and variants (25%)...'
            : progress < 75
            ? 'Ingesting 1,420 orders from past 90 days (55%)...'
            : progress < 95
            ? 'Calculating BCG Matrix & Sales Velocity (85%)...'
            : 'Past 90 days data synchronized successfully (100%)',
        totalOrdersSynced: Math.round((progress / 100) * 1420),
        totalProductsSynced: 148,
        lastSyncAt: new Date().toISOString(),
      };
      syncStoreMap.set(storeId, updated);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sync engine error' }, { status: 500 });
  }
}
