import { render } from '@testing-library/react';
import { vi } from 'vitest';
import ReceiptUpload from '../../components/ReceiptUpload/ReceiptUpload';

/**
 * Default props for ReceiptUpload.
 * Every prop can be overridden via the `overrides` parameter.
 */
const defaultProps = {
  id: 'receipt-upload',
  file: null,
  onChange: vi.fn(),
  onRemove: vi.fn(),
};

/**
 * Renders ReceiptUpload with sensible defaults.
 *
 * @param {Partial<typeof defaultProps>} overrides
 * @returns {{ props: typeof defaultProps } & ReturnType<typeof render>}
 */
export function renderReceiptUpload(overrides = {}) {
  const props = { ...defaultProps, onChange: vi.fn(), onRemove: vi.fn(), ...overrides };
  const result = render(<ReceiptUpload {...props} />);
  return { ...result, props };
}
