import { describe, expect, test } from 'vitest';
import { formatAmount, parseAmount } from './formatAmount';

describe('formatAmount', () => {
  test('formats integer values with two decimal places', () => {
    expect(formatAmount(1000)).toBe('1,000.00');
    expect(formatAmount('1000', 'INR')).toBe('1,000.00 INR');
  });

  test('formats decimal values with two decimal places', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50');
    expect(formatAmount('1234.5', 'USD')).toBe('1,234.50 USD');
  });

  test('formats zero as zero with two decimal places', () => {
    expect(formatAmount(0)).toBe('0.00');
    expect(formatAmount('0', 'INR')).toBe('0.00 INR');
  });

  test('treats null as zero', () => {
    expect(formatAmount(null)).toBe('0.00');
  });

  test('treats undefined as zero', () => {
    expect(formatAmount(undefined)).toBe('0.00');
  });

  test('treats empty strings as zero', () => {
    expect(formatAmount('')).toBe('0.00');
    expect(formatAmount('   ', 'INR')).toBe('0.00 INR');
  });

  test('treats invalid values as zero', () => {
    expect(formatAmount('abc')).toBe('0.00');
    expect(formatAmount('1,234')).toBe('1.00');
  });

  test('treats negative values as zero', () => {
    expect(formatAmount(-50)).toBe('0.00');
    expect(formatAmount('-50', 'INR')).toBe('0.00 INR');
  });
});

describe('parseAmount', () => {
  test('parses valid numeric values', () => {
    expect(parseAmount(100)).toBe(100);
    expect(parseAmount('100.25')).toBe(100.25);
  });

  test('returns zero for empty, invalid, or negative values', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('abc')).toBe(0);
    expect(parseAmount(-10)).toBe(0);
    expect(parseAmount(null)).toBe(0);
  });
});
