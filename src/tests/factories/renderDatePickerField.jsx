import { render } from '@testing-library/react';
import { vi } from 'vitest';
import DatePickerField from '../../components/DatePickerField/DatePickerField';

/**
 * Default props for DatePickerField.
 * Every prop can be overridden via the `overrides` parameter.
 */
const defaultProps = {
  id: 'expense-date',
  label: 'Expense date',
  value: '',
  onChange: vi.fn(),
};

/**
 * Renders DatePickerField with sensible defaults.
 *
 * @param {Partial<typeof defaultProps>} overrides
 * @returns {{ props: typeof defaultProps } & ReturnType<typeof render>}
 */
export function renderDatePickerField(overrides = {}) {
  const props = { ...defaultProps, onChange: vi.fn(), ...overrides };
  const result = render(<DatePickerField {...props} />);
  return { ...result, props };
}
