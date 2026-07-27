import { render } from '@testing-library/react';
import { vi } from 'vitest';
import ExpenseEntryRow from '../../pages/ExpenseSubmission/components/ExpenseEntryRow/ExpenseEntryRow';

/**
 * Canonical base entry used across ExpenseEntryRow tests.
 */
export const baseEntry = {
  id: 'entry-1',
  category: 'travel',
  date: '2026-07-15',
  amount: '150',
  currency: 'INR',
  receipt: null,
};

/**
 * Default props for ExpenseEntryRow.
 * Every prop can be overridden via the `overrides` parameter.
 */
const defaultProps = {
  entry: baseEntry,
  index: 0,
  errors: {},
  warnings: {},
  onChange: vi.fn(),
  onReceiptChange: vi.fn(),
  onReceiptRemove: vi.fn(),
  onRemove: vi.fn(),
  removable: true,
};

/**
 * Renders ExpenseEntryRow with sensible defaults.
 *
 * @param {Partial<typeof defaultProps>} overrides
 * @returns {{ props: typeof defaultProps } & ReturnType<typeof render>}
 */
export function renderExpenseEntryRow(overrides = {}) {
  const props = {
    ...defaultProps,
    onChange: vi.fn(),
    onReceiptChange: vi.fn(),
    onReceiptRemove: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  };
  const result = render(<ExpenseEntryRow {...props} />);
  return { ...result, props };
}
