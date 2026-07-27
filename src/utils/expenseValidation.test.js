import { describe, expect, test } from 'vitest';
import { validateEntry, validateAllEntries, getPolicyWarnings, getAllPolicyWarnings } from './expenseValidation';

describe('expenseValidation', () => {
  describe('validateEntry', () => {
    test('returns no errors for a valid expense entry', () => {
      const entry = {
        category: 'meals',
        date: '2026-07-21',
        amount: '250',
        receipt: 'receipt.png',
      };

      expect(validateEntry(entry)).toEqual({});
    });

    test('returns an error when category is missing', () => {
      const entry = {
        category: '',
        date: '2026-07-21',
        amount: '250',
        receipt: 'receipt.png',
      };

      expect(validateEntry(entry)).toMatchObject({
        category: 'Category is required.',
      });
    });

    test('returns an error when date is missing', () => {
      const entry = {
        category: 'travel',
        date: '',
        amount: '250',
        receipt: 'receipt.png',
      };

      expect(validateEntry(entry)).toMatchObject({
        date: 'Expense date is required.',
      });
    });

    test('returns an error when amount is missing', () => {
      const entry = {
        category: 'travel',
        date: '2026-07-21',
        amount: '',
        receipt: 'receipt.png',
      };

      expect(validateEntry(entry)).toMatchObject({
        amount: 'Amount is required.',
      });
    });

    test('returns an error when amount is zero or negative', () => {
      expect(validateEntry({ category: 'travel', date: '2026-07-21', amount: '0', receipt: 'receipt.png' })).toMatchObject({
        amount: 'Amount must be greater than 0.',
      });

      expect(validateEntry({ category: 'travel', date: '2026-07-21', amount: '-10', receipt: 'receipt.png' })).toMatchObject({
        amount: 'Amount must be greater than 0.',
      });
    });

    test('returns an error when receipt is missing', () => {
      const entry = {
        category: 'travel',
        date: '2026-07-21',
        amount: '250',
        receipt: '',
      };

      expect(validateEntry(entry)).toMatchObject({
        receipt: 'A receipt image is required.',
      });
    });

    test('returns multiple validation errors for a fully invalid entry', () => {
      const entry = {
        category: '',
        date: '',
        amount: '0',
        receipt: '',
      };

      expect(validateEntry(entry)).toEqual({
        category: 'Category is required.',
        date: 'Expense date is required.',
        amount: 'Amount must be greater than 0.',
        receipt: 'A receipt image is required.',
      });
    });
  });

  describe('validateAllEntries', () => {
    test('returns isValid true when every entry passes validation', () => {
      const entries = [{ id: 'a', category: 'meals', date: '2026-07-21', amount: '250', receipt: 'receipt.png' }];

      expect(validateAllEntries(entries)).toEqual({ entryErrors: {}, isValid: true });
    });

    test('returns per-entry errors and marks the bulk validation as invalid', () => {
      const entries = [
        { id: 'a', category: '', date: '2026-07-21', amount: '250', receipt: 'receipt.png' },
        { id: 'b', category: 'travel', date: '', amount: '0', receipt: '' },
      ];

      expect(validateAllEntries(entries)).toEqual({
        entryErrors: {
          a: { category: 'Category is required.' },
          b: {
            date: 'Expense date is required.',
            amount: 'Amount must be greater than 0.',
            receipt: 'A receipt image is required.',
          },
        },
        isValid: false,
      });
    });
  });

  describe('policy warnings', () => {
    test('returns no warnings for entries within policy limits', () => {
      const entry = { category: 'meals', amount: '400' };

      expect(getPolicyWarnings(entry)).toEqual({});
    });

    test('returns a warning when an entry exceeds the policy limit', () => {
      const entry = { category: 'meals', amount: '600' };

      expect(getPolicyWarnings(entry)).toEqual({
        amount: 'Exceeds policy limit of ₹500 for this category.',
      });
    });

    test('returns warnings for all entries that exceed policy limits', () => {
      const entries = [
        { id: 'a', category: 'meals', amount: '600' },
        { id: 'b', category: 'travel', amount: '6000' },
      ];

      expect(getAllPolicyWarnings(entries)).toEqual({
        a: {
          amount: 'Exceeds policy limit of ₹500 for this category.',
        },
        b: {
          amount: 'Exceeds policy limit of ₹5,000 for this category.',
        },
      });
    });

    test('returns no warnings for unsupported categories', () => {
      const entry = { category: 'misc', amount: '10000' };

      expect(getPolicyWarnings(entry)).toEqual({});
    });
  });
});
