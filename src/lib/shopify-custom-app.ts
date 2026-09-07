/**
 * Shopify Custom App (Private Internal Tool) Direct GraphQL Client
 * Supports both direct Admin API Access Token (shpat_...)
 * and automated Client Credentials Grant (SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET)
 * for zero-friction background token generation.
 */

export interface ShopifyCustomAppConfig {
  storeDomain: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  apiVersion?: string;
}

// In-memory token cache for automatically exchanged tokens
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export function getCustomAppConfig(): ShopifyCustomAppConfig {
  return {
    storeDomain:
      process.env.SHOPIFY_STORE_DOMAIN ||
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
      '7dyz3u-i1.myshopify.com',
    accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || '',
    clientId: process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_API_KEY || '',
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-10',
  };
}

/**
 * Automatically resolves a valid access token.
 * If user entered an shpss_ secret or provided clientId/clientSecret,
 * it performs a Client Credentials exchange with Shopify automatically.
 */
export async function resolveAccessToken(
  config: ShopifyCustomAppConfig
): Promise<{ token?: string; error?: string }> {
  const rawToken = config.accessToken?.trim();
  const domain = config.storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // 1. If we have a direct shpat_ or offline token, use it immediately
  if (rawToken && !rawToken.startsWith('shpss_')) {
    return { token: rawToken };
  }

  // 2. Check if we have a fresh cached token in memory
  const cached = tokenCache.get(domain);
  if (cached && cached.expiresAt > Date.now()) {
    return { token: cached.token };
  }

  // 3. Prepare credentials for Client Credentials grant
  const secret =
    (rawToken && rawToken.startsWith('shpss_') ? rawToken : config.clientSecret) ||
    process.env.SHOPIFY_CLIENT_SECRET ||
    '';
  const id = config.clientId || process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_API_KEY || '';

  if (!secret || !id) {
    if (rawToken?.startsWith('shpss_')) {
      return {
        error:
          'Girdiğiniz anahtar bir Client Secret (shpss_...). Otomatik token değişimi için lütfen Client ID bilginizi de girin veya .env dosyasına SHOPIFY_CLIENT_ID tanımlayın.',
      };
    }
    return { error: 'Geçerli bir Shopify Admin Access Token veya Client Credentials bulunamadı.' };
  }

  // 4. Attempt Client Credentials Grant
  try {
    const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: id,
        client_secret: secret,
      }).toString(),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.access_token) {
      // Cache token for 23 hours
      tokenCache.set(domain, {
        token: data.access_token,
        expiresAt: Date.now() + 23 * 60 * 60 * 1000,
      });
      return { token: data.access_token };
    }

    if (data.error === 'application_cannot_be_found') {
      return {
        error: `Shopify API uygulaması bulunamadı (${id}). Lütfen Client ID'nizin tam olarak 32 karakter olduğunu kontrol edin.`,
      };
    }

    if (data.error === 'shop_not_permitted') {
      return {
        error:
          'Bu mağazada doğrudan Client Credentials izni bulunmuyor. Lütfen "scripts/get-token.js" aracını çalıştırarak 1-tıkla yetkilendirme yapın.',
      };
    }

    return {
      error: `Shopify Token Değişimi Hatası: ${data.error_description || data.error || res.statusText}`,
    };
  } catch (err: any) {
    return { error: `Shopify bağlantı hatası: ${err.message}` };
  }
}

/**
 * Executes a GraphQL query against your private Shopify store Admin API
 */
export async function shopifyGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  customConfig?: Partial<ShopifyCustomAppConfig>
): Promise<{ data?: T; errors?: any[]; isLive: boolean }> {
  const baseConfig = getCustomAppConfig();
  const config = { ...baseConfig, ...customConfig };

  if (!config.storeDomain) {
    return {
      isLive: false,
      errors: [{ message: 'No Shopify store domain configured. Using local live simulation.' }],
    };
  }

  // Resolve valid access token (direct shpat_ or auto client_credentials)
  const { token, error: tokenError } = await resolveAccessToken(config);

  if (!token) {
    return {
      isLive: false,
      errors: [{ message: tokenError || 'No valid Shopify token available.' }],
    };
  }

  const endpoint = `https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        isLive: false,
        errors: [{ message: `Shopify HTTP ${response.status}: ${text}` }],
      };
    }

    const json = await response.json();
    return {
      data: json.data,
      errors: json.errors,
      isLive: !json.errors,
    };
  } catch (error: any) {
    return {
      isLive: false,
      errors: [{ message: error.message || 'Shopify network connection failed' }],
    };
  }
}

/**
 * Pre-built GraphQL query to fetch real products, inventory, and pricing
 */
export const FETCH_PRODUCTS_QUERY = `
  query FetchCatalog($first: Int = 50) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          status
          vendor
          productType
          totalInventory
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                price
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Pre-built GraphQL query to fetch recent orders, sales volume and AOV
 */
export const FETCH_ORDERS_QUERY = `
  query FetchRecentOrders($first: Int = 100) {
    orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          id
          name
          processedAt
          financialStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 5) {
            edges {
              node {
                title
                quantity
                originalUnitPriceSet {
                  shopMoney {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Pre-built GraphQL query to fetch shop metadata (name, currency, domain)
 */
export const FETCH_SHOP_QUERY = `
  query FetchShopDetails {
    shop {
      name
      email
      myshopifyDomain
      currencyCode
    }
  }
`;

