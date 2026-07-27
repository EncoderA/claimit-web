/**
 * DatePickerField tests — real react-datepicker integration.
 *
 * The full react-datepicker component is used here without mocking.
 * Only minimal JSDOM stubs are required:
 *
 *   • URL.createObjectURL / URL.revokeObjectURL — already provided in
 *     src/test/setup.js because JSDOM lacks the Blob URL API.
 *   • ResizeObserver — react-datepicker's popper uses it internally;
 *     JSDOM has no implementation so we stub it below.
 *   • getBoundingClientRect — returns zeros in JSDOM which is fine for
 *     these tests; popper positioning does not affect functional behaviour.
 *
 * Calendar popup day-cell clicks are used sparingly because they are
 * positional (day cells contain numbers that vary with the current date).
 * Most tests interact via the text input, which exercises the same
 * onChange / value contract and is more stable.
 */
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import DatePickerField from './DatePickerField';
import { renderDatePickerField } from '../../tests/factories/renderDatePickerField';

// Stub ResizeObserver — required by react-datepicker's popper but absent in JSDOM.
beforeAll(() => {
  if (typeof ResizeObserver === 'undefined') {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('DatePickerField', () => {
  // ── Rendering ──────────────────────────────────────────────────────
  test('renders successfully with the expected placeholder and label', () => {
    renderDatePickerField();

    expect(screen.getByLabelText('Expense date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('DD-MM-YYYY')).toBeInTheDocument();
  });

  test('displays the supplied value when a valid date is provided', () => {
    renderDatePickerField({ value: '2026-07-15' });

    expect(screen.getByDisplayValue('15-07-2026')).toBeInTheDocument();
  });

  test('applies the required styling when the required prop is provided', () => {
    renderDatePickerField({ required: true });

    expect(screen.getByText('Expense date')).toHaveClass('date-picker-field__label--required');
    expect(screen.getByLabelText('Expense date, required')).toBeInTheDocument();
  });

  test('renders validation feedback when an error is provided', () => {
    renderDatePickerField({ error: 'Date is required' });

    expect(screen.getByRole('alert')).toHaveTextContent('Date is required');
    expect(screen.getByLabelText('Expense date')).toHaveAttribute('aria-invalid', 'true');
  });

  // ── Manual text entry ───────────────────────────────────────────────
  test('updates the input and calls onChange when a valid manual date is entered', async () => {
    const user = userEvent.setup();
    const { props } = renderDatePickerField();

    const input = screen.getByLabelText('Expense date');
    await user.type(input, '15-07-2026');
    await user.tab();

    expect(input).toHaveValue('15-07-2026');
    expect(props.onChange).toHaveBeenCalledWith('2026-07-15');
  });

  test('reverts to the previous value when an invalid manual date is entered', async () => {
    const user = userEvent.setup();
    renderDatePickerField({ value: '2026-07-15' });

    const input = screen.getByLabelText('Expense date');
    await user.clear(input);
    await user.type(input, 'invalid');
    await user.tab();

    expect(input).toHaveValue('15-07-2026');
  });

  test('keeps the input empty when an invalid value is entered without an existing selection', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    const input = screen.getByLabelText('Expense date');
    await user.clear(input);
    await user.type(input, 'not-a-date');
    await user.tab();

    expect(input).toHaveValue('');
  });

  test('commits an entered value on Enter and closes the calendar', async () => {
    const user = userEvent.setup();
    const { props } = renderDatePickerField();

    // Open the calendar first so we can confirm it closes
    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByRole('button', { name: /open calendar/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    const input = screen.getByLabelText('Expense date');
    await user.clear(input);
    await user.type(input, '15-07-2026');
    await user.keyboard('{Enter}');

    expect(props.onChange).toHaveBeenCalledWith('2026-07-15');
    // Calendar should close after Enter
    expect(screen.getByRole('button', { name: /open calendar/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('closes the calendar when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    await user.click(screen.getByRole('button', { name: /open calendar/i }));
    expect(screen.getByRole('button', { name: /open calendar/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await user.type(screen.getByLabelText('Expense date'), '{Escape}');

    expect(screen.getByRole('button', { name: /open calendar/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('applies the open styling class while the calendar is visible', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    const input = screen.getByLabelText('Expense date');
    expect(input).not.toHaveClass('date-picker-field__input--open');

    await user.click(screen.getByRole('button', { name: /open calendar/i }));

    expect(input).toHaveClass('date-picker-field__input--open');
  });

  // ── Calendar popup — real react-datepicker ──────────────────────────
  test('opens the calendar popup when the icon button is clicked', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    await user.click(screen.getByRole('button', { name: /open calendar/i }));

    // react-datepicker renders a month container when open
    expect(document.querySelector('.react-datepicker')).toBeInTheDocument();
  });

  test('renders month and year dropdowns in the custom calendar header', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    await user.click(screen.getByRole('button', { name: /open calendar/i }));

    expect(screen.getByLabelText('Select month')).toBeInTheDocument();
    expect(screen.getByLabelText('Select year')).toBeInTheDocument();
  });

  test('changing the month dropdown updates the calendar view', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    await user.click(screen.getByRole('button', { name: /open calendar/i }));

    const monthSelect = screen.getByLabelText('Select month');
    fireEvent.change(monthSelect, { target: { value: '1' } }); // February (0-indexed)

    expect(monthSelect).toHaveValue('1');
  });

  test('changing the year dropdown updates the calendar view', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    await user.click(screen.getByRole('button', { name: /open calendar/i }));

    const yearSelect = screen.getByLabelText('Select year');
    const currentYear = new Date().getFullYear();
    fireEvent.change(yearSelect, { target: { value: String(currentYear - 1) } });

    expect(yearSelect).toHaveValue(String(currentYear - 1));
  });

  test('previous month button is present in the calendar header', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    await user.click(screen.getByRole('button', { name: /open calendar/i }));

    expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
  });

  test('next month button is present in the calendar header', async () => {
    const user = userEvent.setup();
    renderDatePickerField();

    await user.click(screen.getByRole('button', { name: /open calendar/i }));

    expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
  });

  // ── Controlled value sync ───────────────────────────────────────────
  test('syncs the visible input when the controlled value is cleared', () => {
    const { rerender, props } = renderDatePickerField({ value: '2026-07-15' });

    expect(screen.getByDisplayValue('15-07-2026')).toBeInTheDocument();

    rerender(
      <DatePickerField
        id={props.id}
        label={props.label}
        value=""
        onChange={props.onChange}
      />,
    );

    expect(screen.getByLabelText('Expense date')).toHaveValue('');
  });
});
