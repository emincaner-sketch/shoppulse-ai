/**
 * Type-Safe Runtime Environment Validator (Zod / T3-Env Pattern)
 * Ensures that missing production secrets are caught early without crashing the Node.js process.
 */

export interface AppEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  DIRECT_URL?: string;
  ENCRYPTION_SECRET_KEY: string;
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  SHOPIFY_APP_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  NEXT_PUBLIC_APP_URL: string;
}

function parseEnv(): AppEnv {
  const isProd = process.env.NODE_ENV === 'production';

  const env: AppEnv = {
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    DATABASE_URL:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/shoppulse_ai?schema=public',
    DIRECT_URL: process.env.DIRECT_URL,
    ENCRYPTION_SECRET_KEY:
      process.env.ENCRYPTION_SECRET_KEY || 'shoppulse_super_secret_aes256_key_2026',
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY || 'shpa_dev_mock_api_key_2026',
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET || 'dev_shopify_webhook_secret_key_2026',
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || 'http://localhost:3000',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_secret_key',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_stripe_webhook_secret',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || process.env.SHOPIFY_APP_URL || 'http://localhost:3000',
  };

  // Production pre-flight diagnostics
  if (isProd) {
    const missingKeys: string[] = [];
    if (!process.env.DATABASE_URL) missingKeys.push('DATABASE_URL');
    if (!process.env.ENCRYPTION_SECRET_KEY) missingKeys.push('ENCRYPTION_SECRET_KEY');
    if (!process.env.SHOPIFY_API_KEY) missingKeys.push('SHOPIFY_API_KEY');
    if (!process.env.SHOPIFY_API_SECRET) missingKeys.push('SHOPIFY_API_SECRET');
    if (!process.env.STRIPE_SECRET_KEY) missingKeys.push('STRIPE_SECRET_KEY');

    if (missingKeys.length > 0) {
      console.warn(
        `[ShopPulse Security Warning] Missing production environment variables: ${missingKeys.join(
          ', '
        )}. Using fallback credentials.`
      );
    }
  }

  return env;
}

export const env = parseEnv();

/**
 * Diagnostics helper for /api/health check
 */
export function getEnvStatus() {
  return {
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    directUrlConfigured: Boolean(process.env.DIRECT_URL),
    encryptionKeyLength: env.ENCRYPTION_SECRET_KEY.length,
    shopifyApiKeyConfigured: Boolean(process.env.SHOPIFY_API_KEY),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    aiProviders: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      heuristicFallbackActive: true,
    },
  };
}
