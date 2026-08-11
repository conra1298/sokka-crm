import { describe, it, expect } from 'vitest';
import { normalizeEmail, normalizeDomain, formatCurrency, isOverdue } from '@/lib/utils/normalization';

describe('Normalization Utilities', () => {
  it('normalizes email addresses by trimming, lowercasing, and removing plus addressing', () => {
    expect(normalizeEmail('  John.Doe+sales@Gmail.com ')).toBe('johndoe@gmail.com');
    expect(normalizeEmail('pepper@starkindustries.com')).toBe('pepper@starkindustries.com');
    expect(normalizeEmail('USER+test@domain.com')).toBe('user@domain.com');
  });

  it('normalizes company domains by removing protocols and www prefixes', () => {
    expect(normalizeDomain('https://WWW.AcmeCorp.com/about')).toBe('acmecorp.com');
    expect(normalizeDomain('http://starkindustries.com?ref=1')).toBe('starkindustries.com');
    expect(normalizeDomain('  GLOBEX.COM  ')).toBe('globex.com');
  });

  it('formats monetary currency amounts correctly', () => {
    expect(formatCurrency(45000)).toBe('$45,000.00');
    expect(formatCurrency('120000.50')).toBe('$120,000.50');
    expect(formatCurrency(null)).toBe('$0.00');
  });

  it('correctly calculates overdue task dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    expect(isOverdue(pastDate.toISOString(), false)).toBe(true);
    expect(isOverdue(pastDate.toISOString(), true)).toBe(false); // Completed tasks are not overdue!
    expect(isOverdue(futureDate.toISOString(), false)).toBe(false);
  });
});
