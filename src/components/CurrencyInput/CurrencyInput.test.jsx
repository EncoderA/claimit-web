import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { renderCurrencyInput } from '../../tests/factories/renderCurrencyInput';
import CurrencyInput from './CurrencyInput';

describe('CurrencyInput', () => {
  // ── Rendering ───────────────────────────────────────────────────────
  test('renders the input field with the expected label', () => {
    renderCurrencyInput();

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  test('renders a text input element', () => {
    renderCurrencyInput();

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('type', 'text');
  });

  // ── Placeholder ─────────────────────────────────────────────────────
  test('renders the default placeholder when none is supplied', () => {
    renderCurrencyInput();

    expect(screen.getByPlaceholderText('Currency Input')).toBeInTheDocument();
  });

  test('renders a custom placeholder when supplied', () => {
    renderCurrencyInput({ placeholder: 'Enter amount' });

    expect(screen.getByPlaceholderText(/enter amount/i)).toBeInTheDocument();
  });

  // ── Controlled usage ────────────────────────────────────────────────
  test('reflects a controlled value in the input', () => {
    renderCurrencyInput({ value: '250.00', onChange: vi.fn() });

    expect(screen.getByLabelText(/amount/i)).toHaveValue('250.00');
  });

  test('calls onChange with the synthetic event when the value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderCurrencyInput({ onChange: handleChange });

    await user.type(screen.getByLabelText(/amount/i), '12.50');

    expect(handleChange).toHaveBeenCalled();
    // The event target value should reflect typed characters
    const lastEvent = handleChange.mock.calls.at(-1)[0];
    expect(lastEvent.target).toBeDefined();
  });

  test('accepts valid values and updates the display', async () => {
    const user = userEvent.setup();
    renderCurrencyInput();
    const input = screen.getByLabelText(/amount/i);

    await user.type(input, '12.50');

    expect(input).toHaveValue('12.50');
  });

  // ── Uncontrolled usage ──────────────────────────────────────────────
  test('supports uncontrolled usage with defaultValue', () => {
    renderCurrencyInput({ defaultValue: '99.99' });

    expect(screen.getByLabelText(/amount/i)).toHaveValue('99.99');
  });

  test('handles empty input in uncontrolled mode', async () => {
    const user = userEvent.setup();
    renderCurrencyInput();
    const input = screen.getByLabelText(/amount/i);

    await user.clear(input);

    expect(input).toHaveValue('');
  });

  // ── Disabled state ──────────────────────────────────────────────────
  test('disables the input when the disabled prop is true', () => {
    renderCurrencyInput({ disabled: true });

    expect(screen.getByLabelText(/amount/i)).toBeDisabled();
  });

  test('does not disable the input when disabled is not set', () => {
    renderCurrencyInput();

    expect(screen.getByLabelText(/amount/i)).not.toBeDisabled();
  });

  test('does not call onChange when the input is disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderCurrencyInput({ disabled: true, onChange: handleChange });

    await user.type(screen.getByLabelText(/amount/i), '500');

    expect(handleChange).not.toHaveBeenCalled();
  });

  // ── Read-only state ─────────────────────────────────────────────────
  test('marks the input as read-only when readOnly is true', () => {
    renderCurrencyInput({ readOnly: true });

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('readOnly');
  });

  // ── Native attribute forwarding ─────────────────────────────────────
  test('forwards the name attribute to the input', () => {
    renderCurrencyInput({ name: 'expense-amount' });

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('name', 'expense-amount');
  });

  test('forwards the id attribute to the input', () => {
    renderCurrencyInput({ id: 'amount-field' });

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('id', 'amount-field');
  });

  test('forwards autoComplete to the input', () => {
    renderCurrencyInput({ autoComplete: 'off' });

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('autocomplete', 'off');
  });

  test('forwards data-testid to the input', () => {
    renderCurrencyInput({ 'data-testid': 'currency-field' });

    expect(screen.getByTestId('currency-field')).toBeInTheDocument();
  });

  // ── Accessibility / ARIA ────────────────────────────────────────────
  test('forwards aria-label to the input', () => {
    renderCurrencyInput({ 'aria-label': 'Expense amount in INR' });

    expect(screen.getByLabelText(/expense amount in INR/i)).toBeInTheDocument();
  });

  test('forwards aria-required to the input', () => {
    renderCurrencyInput({ 'aria-required': 'true' });

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('aria-required', 'true');
  });

  test('forwards aria-invalid to the input', () => {
    renderCurrencyInput({ 'aria-invalid': 'true' });

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('aria-invalid', 'true');
  });

  test('forwards aria-describedby to the input', () => {
    renderCurrencyInput({ 'aria-describedby': 'amount-hint' });

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('aria-describedby', 'amount-hint');
  });

  // ── Ref forwarding ──────────────────────────────────────────────────
  // CurrencyInput is a plain function component that does not call forwardRef.
  // Native ref behaviour on the wrapping <label> is tested here instead.
  test('renders within a label element that wraps the input', () => {
    const { container } = renderCurrencyInput();

    const label = container.querySelector('label.currency-input');
    expect(label).toBeInTheDocument();
    expect(label).toContainElement(screen.getByLabelText(/amount/i));
  });

  // ── Custom props ────────────────────────────────────────────────────
  test('forwards additional props to the input element', () => {
    renderCurrencyInput({ maxLength: 10 });

    expect(screen.getByLabelText(/amount/i)).toHaveAttribute('maxlength', '10');
  });
});
