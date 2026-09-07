/**
 * Shopify Custom App (Private Internal Tool) Direct GraphQL Client
 * Connects directly using Shopify Admin API Access Token (shpat_...)
 * without requiring OAuth handshakes, App Store listings, or third-party redirects.
 */

export interface ShopifyCustomAppConfig {
  storeDomain: string;
  accessToken: string;
  apiVersion?: string;
}

export function getCustomAppConfig(): ShopifyCustomAppConfig {
  return {
    storeDomain:
      process.env.SHOPIFY_STORE_DOMAIN ||
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
      'lumina-fashion.myshopify.com',
    accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-10',
  };
}

/**
 * Executes a GraphQL query against your private Shopify store Admin API
 */
export async function shopifyGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  customConfig?: Partial<ShopifyCustomAppConfig>
): Promise<{ data?: T; errors?: any[]; isLive: boolean }> {
  const config = { ...getCustomAppConfig(), ...customConfig };

  if (!config.accessToken || !config.storeDomain) {
    return {
      isLive: false,
      errors: [{ message: 'No Shopify Admin API access token configured. Using local live simulation.' }],
    };
  }

  const endpoint = `https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': config.accessToken,
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
    products(first: $first, sortKey: BEST_SELLING) {
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
