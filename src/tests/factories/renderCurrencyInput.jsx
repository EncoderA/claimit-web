import { render } from '@testing-library/react';
import { vi } from 'vitest';
import CurrencyInput from '../../components/CurrencyInput/CurrencyInput';

/**
 * Default props for CurrencyInput.
 * Every prop can be overridden via the `overrides` parameter.
 */
const defaultProps = {
  placeholder: 'Currency Input',
};

/**
 * Renders CurrencyInput with sensible defaults.
 *
 * @param {Partial<typeof defaultProps>} overrides
 * @returns {{ props: typeof defaultProps } & ReturnType<typeof render>}
 */
export function renderCurrencyInput(overrides = {}) {
  const props = { ...defaultProps, ...overrides };
  const result = render(<CurrencyInput {...props} />);
  return { ...result, props };
}
