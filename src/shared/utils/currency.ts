const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
  ZAR: 'R',
  SGD: 'S$',
  HKD: 'HK$',
};

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
