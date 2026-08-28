import { describe, expect, it } from 'vitest';
import { formatYen, parseYenInput } from '@/utils/currency';

describe('formatYen', () => {
  it('formats an integer amount as JPY with no decimals', () => {
    expect(formatYen(1000)).toBe('¥1,000');
  });

  it('formats zero correctly', () => {
    expect(formatYen(0)).toBe('¥0');
  });
});

describe('parseYenInput', () => {
  it('parses a plain digit string', () => {
    expect(parseYenInput('1500')).toBe(1500);
  });

  it('strips commas, spaces, and the yen sign', () => {
    expect(parseYenInput('¥1,500 ')).toBe(1500);
  });

  it('rejects decimals', () => {
    expect(parseYenInput('10.5')).toBeNull();
  });

  it('rejects negative numbers', () => {
    expect(parseYenInput('-10')).toBeNull();
  });

  it('rejects zero', () => {
    expect(parseYenInput('0')).toBeNull();
  });

  it('rejects non-numeric input', () => {
    expect(parseYenInput('abc')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(parseYenInput('')).toBeNull();
  });
});
