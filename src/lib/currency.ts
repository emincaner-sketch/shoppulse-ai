import { Currency } from '@/types';

/**
 * Static configurable exchange rate matrix relative to base USD (1.0).
 * USD = 1.0, EUR = 0.92, TRY = 34.0
 */
export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; name: string; locale: string }> = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro', locale: 'de-DE' },
  TRY: { symbol: '₺', rate: 34.0, name: 'Türk Lirası', locale: 'tr-TR' },
};

/**
 * Mathematically converts a monetary value from USD to target currency.
 */
export function convertCurrency(amountInUsd: number, targetCurrency: Currency = 'USD'): number {
  if (!amountInUsd || isNaN(amountInUsd)) return 0;
  const config = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.USD;
  return Number((amountInUsd * config.rate).toFixed(2));
}

/**
 * Converts between any two arbitrary currencies in the system.
 */
export function convertBetween(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (!amount || isNaN(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;
  const fromRate = CURRENCY_RATES[fromCurrency]?.rate || 1.0;
  const toRate = CURRENCY_RATES[toCurrency]?.rate || 1.0;
  const inUsd = amount / fromRate;
  return Number((inUsd * toRate).toFixed(2));
}

/**
 * Formats a monetary amount given in USD into the specified currency string with proper symbols and locale formatting.
 */
export function formatCurrency(
  amountUsd: number,
  currency: Currency = 'USD',
  options?: { maximumFractionDigits?: number; compact?: boolean }
): string {
  const config = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = convertCurrency(amountUsd, currency);
  const maxDigits = options?.maximumFractionDigits ?? (converted >= 100 ? 0 : 2);

  if (options?.compact && converted >= 1000) {
    if (converted >= 1000000) {
      return `${config.symbol}${(converted / 1000000).toFixed(1)}M`;
    }
    return `${config.symbol}${(converted / 1000).toFixed(1)}k`;
  }

  const formattedNum = converted.toLocaleString(config.locale, {
    maximumFractionDigits: maxDigits,
    minimumFractionDigits: maxDigits > 0 ? maxDigits : 0,
  });

  return `${config.symbol}${formattedNum}`;
}

/**
 * Gets currency symbol
 */
export function getCurrencySymbol(currency: Currency = 'USD'): string {
  return CURRENCY_RATES[currency]?.symbol || '$';
}

/**
 * Gets currency multiplier rate
 */
export function getCurrencyRate(currency: Currency = 'USD'): number {
  return CURRENCY_RATES[currency]?.rate || 1.0;
}
