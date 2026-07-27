import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  baseEntry,
  renderExpenseEntryRow,
} from '../../../../tests/factories/renderExpenseEntryRow';

vi.mock('../../../../components', () => {
  const MockButton = ({ children, ...props }) => <button {...props}>{children}</button>;

  const MockFormField = ({ label, id, error, warning, onChange, ...props }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-label={label} onChange={onChange} {...props} />
      {error ? <span>{error}</span> : null}
      {warning ? <span>{warning}</span> : null}
    </div>
  );

  const MockSelectField = ({ label, id, options = [], error, warning, onChange, ...props }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} aria-label={label} onChange={onChange} {...props}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span>{error}</span> : null}
      {warning ? <span>{warning}</span> : null}
    </div>
  );

  const MockDatePickerField = ({ label, id, error, onChange }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-label={label} />
      <button type="button" onClick={() => onChange('2026-07-21')}>
        Pick date
      </button>
      {error ? <span>{error}</span> : null}
    </div>
  );

  const MockReceiptUpload = ({ id, file, error, onChange, onRemove }) => (
    <div>
      <label htmlFor={id}>Receipt</label>
      <button
        type="button"
        onClick={() => onChange(new File(['receipt'], 'receipt.png', { type: 'image/png' }))}
      >
        Upload receipt
      </button>
      <button type="button" onClick={() => onRemove()}>
        Remove receipt
      </button>
      {file ? <span>{file.name}</span> : null}
      {error ? <span>{error}</span> : null}
    </div>
  );

  return {
    Button: MockButton,
    FormField: MockFormField,
    SelectField: MockSelectField,
    DatePickerField: MockDatePickerField,
    ReceiptUpload: MockReceiptUpload,
  };
});

describe('ExpenseEntryRow', () => {
  let props;

  beforeEach(() => {
    // Each test gets a fresh set of spy functions via the factory.
    ({ props } = renderExpenseEntryRow());
  });

  test('renders the row fields and entry metadata', () => {
    expect(screen.getByRole('group', { name: /expense entry 1/i })).toBeInTheDocument();
    expect(screen.getByText('Expense #1')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Expense Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove expense entry 1/i })).toBeInTheDocument();
  });

  test('calls onChange when the category selection changes', async () => {
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText('Category'), 'accommodation');

    expect(props.onChange).toHaveBeenCalledWith('entry-1', 'category', 'accommodation');
  });

  test('calls onChange when the amount input changes', async () => {
    const user = userEvent.setup();

    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '325');

    const lastCall = props.onChange.mock.calls.at(-1);
    expect(lastCall[0]).toBe('entry-1');
    expect(lastCall[1]).toBe('amount');
    expect(typeof lastCall[2]).toBe('string');
    expect(lastCall[2].length).toBeGreaterThan(0);
  });

  test('calls onChange when a date is selected', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /pick date/i }));

    expect(props.onChange).toHaveBeenCalledWith('entry-1', 'date', '2026-07-21');
  });

  test('calls onReceiptChange and onReceiptRemove for receipt actions', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /upload receipt/i }));
    await user.click(screen.getByRole('button', { name: /remove receipt/i }));

    expect(props.onReceiptChange).toHaveBeenCalledWith('entry-1', expect.any(File));
    expect(props.onReceiptRemove).toHaveBeenCalledWith('entry-1');
  });

  test('calls onRemove when the remove row button is clicked', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /remove expense entry 1/i }));

    expect(props.onRemove).toHaveBeenCalledWith('entry-1');
  });

  test('disables the remove button when removable is false', () => {
    renderExpenseEntryRow({ removable: false });

    // Both the beforeEach render and this render are in the DOM;
    // only the newly rendered instance (last button) is disabled.
    const buttons = screen.getAllByRole('button', { name: /remove expense entry/i });
    expect(buttons.at(-1)).toBeDisabled();
  });

  test('renders validation messages from the errors prop', () => {
    renderExpenseEntryRow({
      errors: { category: 'Category is required.', amount: 'Amount is required.' },
    });

    expect(screen.getByText('Category is required.')).toBeInTheDocument();
    expect(screen.getByText('Amount is required.')).toBeInTheDocument();
  });

  test('renders policy warnings when warnings are provided', () => {
    renderExpenseEntryRow({ warnings: { amount: 'Exceeds policy limit.' } });

    expect(screen.getByRole('status')).toHaveTextContent('Exceeds policy limit.');
  });

  test('renders an uploaded receipt name when file is present', () => {
    renderExpenseEntryRow({
      entry: { ...baseEntry, receipt: new File(['x'], 'receipt.png', { type: 'image/png' }) },
    });

    expect(screen.getByText('receipt.png')).toBeInTheDocument();
  });

  test('calls onChange for currency selection', async () => {
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText('Currency'), 'USD');

    expect(props.onChange).toHaveBeenCalledWith('entry-1', 'currency', 'USD');
  });
});
