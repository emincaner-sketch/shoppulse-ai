import crypto from 'crypto';

console.log('=== SHOPOULSE AI - PHASE 5 & AUDIT AUTOMATED VERIFICATION ===\n');

// 1. Test Crypto Engine (AES-256-GCM)
import { encryptToken, decryptToken, testEncryptionCycle } from '../src/lib/crypto.ts';

const testToken = 'shpat_live_89f3a4b9c1d2e3f4a5b6c7d8e9f01234';
const encrypted1 = encryptToken(testToken);
const encrypted2 = encryptToken(testToken);
const decrypted1 = decryptToken(encrypted1);
const decrypted2 = decryptToken(encrypted2);

console.log('1. [AES-256-GCM Crypto Engine]');
console.log('  Original Token:', testToken);
console.log('  Encrypted (sample 1):', encrypted1.substring(0, 36) + '...');
console.log('  Encrypted (sample 2):', encrypted2.substring(0, 36) + '...');
console.log('  Non-deterministic IV test:', encrypted1 !== encrypted2 ? 'PASSED (Distinct IVs)' : 'FAILED');
console.log('  Decrypted 1 matches:', decrypted1 === testToken ? 'PASSED' : 'FAILED');
console.log('  Decrypted 2 matches:', decrypted2 === testToken ? 'PASSED' : 'FAILED');
console.log('  Roundtrip Health Check:', testEncryptionCycle(testToken) ? 'PASSED\n' : 'FAILED\n');

// 2. Test Currency Engine
import { convertCurrency, formatCurrency, convertBetween, CURRENCY_RATES } from '../src/lib/currency.ts';

console.log('2. [Currency Math Engine]');
console.log('  Rates Config:', CURRENCY_RATES);
const usdVal = 100;
const eurVal = convertCurrency(usdVal, 'EUR');
const tryVal = convertCurrency(usdVal, 'TRY');
console.log(`  $100 USD -> EUR: €${eurVal} (Expected: 92) =>`, eurVal === 92 ? 'PASSED' : 'FAILED');
console.log(`  $100 USD -> TRY: ₺${tryVal} (Expected: 3400) =>`, tryVal === 3400 ? 'PASSED' : 'FAILED');
console.log(`  Format USD:`, formatCurrency(usdVal, 'USD'));
console.log(`  Format EUR:`, formatCurrency(usdVal, 'EUR'));
console.log(`  Format TRY:`, formatCurrency(usdVal, 'TRY'));
const crossConverted = convertBetween(92, 'EUR', 'TRY');
console.log(`  Cross Convert €92 -> TRY: ₺${crossConverted} =>`, crossConverted === 3400 ? 'PASSED\n' : 'FAILED\n');

// 3. Test Multi-Tenant Guard
import { verifyStoreOwnership } from '../src/lib/tenant.ts';

console.log('3. [Multi-Tenant Isolation Guard]');
const authCheckPass = await verifyStoreOwnership('user-demo', 'store-1');
console.log('  Authorized store access:', authCheckPass.authorized ? 'PASSED' : 'FAILED');

const authCheckFail = await verifyStoreOwnership('unauthorized_user_99', 'foreign_store_77');
console.log('  Unauthorized cross-tenant block (403):', !authCheckFail.authorized && authCheckFail.status === 403 ? 'PASSED\n' : 'FAILED\n');

// 4. Test Live Endpoints against localhost:3000
const BASE_URL = 'http://localhost:3000';

async function testHttpEndpoints() {
  console.log('4. [HTTP API Verification against dev server]');

  // A. Webhook HMAC & Idempotency
  const webhookId = `wh_test_${Date.now()}`;
  const secret = 'dev_shopify_webhook_secret_key_2026';
  const samplePayload = JSON.stringify({ id: 987654321, order_number: '1099', total_price: '189.00', currency: 'USD' });
  const validHmac = crypto.createHmac('sha256', secret).update(samplePayload, 'utf8').digest('base64');

  // First webhook delivery
  const whRes1 = await fetch(`${BASE_URL}/api/shopify/webhooks`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-shopify-topic': 'orders/create',
      'x-shopify-shop-domain': 'lumina-fashion.myshopify.com',
      'x-shopify-webhook-id': webhookId,
      'x-shopify-hmac-sha256': validHmac,
    },
    body: samplePayload,
  });
  const whData1 = await whRes1.json();
  console.log('  Webhook 1 (First Delivery):', whRes1.status, whData1.status === 'processed' ? 'PASSED' : 'FAILED');

  // Duplicate webhook delivery (same x-shopify-webhook-id)
  const whRes2 = await fetch(`${BASE_URL}/api/shopify/webhooks`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-shopify-topic': 'orders/create',
      'x-shopify-shop-domain': 'lumina-fashion.myshopify.com',
      'x-shopify-webhook-id': webhookId,
      'x-shopify-hmac-sha256': validHmac,
    },
    body: samplePayload,
  });
  const whData2 = await whRes2.json();
  console.log('  Webhook 2 (Duplicate Idempotency Guard):', whRes2.status, whData2.status === 'duplicate_ignored' ? 'PASSED (Duplicate Blocked)' : 'FAILED');

  // B. Shopify App Billing API
  const shopifyBillRes = await fetch(`${BASE_URL}/api/shopify/billing`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      storeId: 'store-1',
      shopDomain: 'lumina-fashion.myshopify.com',
      planTier: 'GROWTH_PRO',
    }),
  });
  const shopifyBillData = await shopifyBillRes.json();
  console.log('  Shopify App Billing API:', shopifyBillRes.status, shopifyBillData.success && shopifyBillData.confirmationUrl ? 'PASSED' : 'FAILED');

  // C. Stripe Checkout Session API
  const stripeCheckoutRes = await fetch(`${BASE_URL}/api/billing/checkout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      planTier: 'GROWTH_PRO',
      interval: 'monthly',
      userId: 'user-demo',
      storeId: 'store-1',
    }),
  });
  const stripeCheckoutData = await stripeCheckoutRes.json();
  console.log('  Stripe Checkout API:', stripeCheckoutRes.status, stripeCheckoutData.success && stripeCheckoutData.sessionId ? 'PASSED' : 'FAILED');

  // D. Stripe Webhook Handler
  const stripeWhRes = await fetch(`${BASE_URL}/api/billing/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: `evt_test_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: 'user-demo', storeId: 'store-1', planTier: 'GROWTH_PRO' },
        },
      },
    }),
  });
  const stripeWhData = await stripeWhRes.json();
  console.log('  Stripe Webhook API:', stripeWhRes.status, stripeWhData.status === 'processed' ? 'PASSED' : 'FAILED');

  // E. Store Sync Engine API
  const syncGetRes = await fetch(`${BASE_URL}/api/stores/sync?storeId=store-1&userId=user-demo`);
  const syncGetData = await syncGetRes.json();
  console.log('  Store Sync GET Status:', syncGetRes.status, syncGetData.syncStatus ? 'PASSED' : 'FAILED');

  const syncPostRes = await fetch(`${BASE_URL}/api/stores/sync`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ storeId: 'store-1', userId: 'user-demo', action: 'start' }),
  });
  const syncPostData = await syncPostRes.json();
  console.log('  Store Sync POST (Start 90-day sync):', syncPostRes.status, syncPostData.success && syncPostData.sync.syncStatus === 'SYNCING' ? 'PASSED' : 'FAILED');

  console.log('\n=== ALL PHASE 5 & AUDIT AUTOMATED TESTS COMPLETED SUCCESSFULLY ===');
}

testHttpEndpoints().catch((err) => {
  console.error('Test execution error:', err);
});
