const formatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

/** Formats an integer yen amount (already in minor units, which for JPY = major units) for display. */
export function formatYen(amountMinor: number): string {
  return formatter.format(amountMinor);
}

/**
 * Parses user-entered text into an integer yen amount, or returns null if
 * the input isn't a valid positive amount. Deliberately strict: no
 * scientific notation, no negative numbers, no decimals (JPY has none).
 */
export function parseYenInput(raw: string): number | null {
  const cleaned = raw.replace(/[,\s¥]/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isSafeInteger(value) || value <= 0) return null;
  return value;
}
