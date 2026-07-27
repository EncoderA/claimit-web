import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  loadExpenseSubmission,
  renderExpenseSubmission,
} from '../../tests/factories/renderExpenseSubmission';

const mockSubmitExpenseReport = vi.fn();

vi.mock('../../services/expenseService', () => ({
  submitExpenseReport: mockSubmitExpenseReport,
}));

vi.mock('./components/ExpenseEntryRow/ExpenseEntryRow', () => ({
  default: ({
    entry,
    index,
    errors = {},
    warnings = {},
    onChange,
    onReceiptChange,
    onReceiptRemove,
    onRemove,
    removable,
  }) => (
    <div role="group" aria-label={`Expense entry ${index + 1}`}>
      <input
        aria-label={`Category ${index + 1}`}
        value={entry.category}
        onChange={(event) => onChange(entry.id, 'category', event.target.value)}
      />
      <input
        aria-label={`Date ${index + 1}`}
        value={entry.date}
        onChange={(event) => onChange(entry.id, 'date', event.target.value)}
      />
      <input
        aria-label={`Amount ${index + 1}`}
        value={entry.amount}
        onChange={(event) => onChange(entry.id, 'amount', event.target.value)}
      />
      <button
        type="button"
        onClick={() =>
          onReceiptChange(entry.id, new File(['receipt'], 'receipt.png', { type: 'image/png' }))
        }
      >
        Upload receipt
      </button>
      <button type="button" onClick={() => onReceiptRemove(entry.id)}>
        Remove receipt
      </button>
      <button type="button" onClick={() => onRemove(entry.id)} disabled={!removable}>
        Remove row
      </button>
      {errors.category ? <span>{errors.category}</span> : null}
      {errors.date ? <span>{errors.date}</span> : null}
      {errors.amount ? <span>{errors.amount}</span> : null}
      {errors.receipt ? <span>{errors.receipt}</span> : null}
      {warnings.amount ? <span>{warnings.amount}</span> : null}
    </div>
  ),
}));

describe('ExpenseSubmission', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSubmitExpenseReport.mockReset();
    mockSubmitExpenseReport.mockResolvedValue(undefined);
    vi.useRealTimers();
  });

  test('renders the page and shows the initial expense row', async () => {
    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    expect(screen.getByRole('heading', { name: /expense submission/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /expense entry 1/i })).toBeInTheDocument();
    expect(screen.getByText(/add expense/i)).toBeInTheDocument();
  });

  test('adds and removes expense rows', async () => {
    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    await userEvent.click(screen.getByRole('button', { name: /add expense/i }));
    expect(screen.getAllByRole('group')).toHaveLength(2);

    await userEvent.click(screen.getAllByRole('button', { name: /remove row/i })[0]);
    expect(screen.getAllByRole('group')).toHaveLength(1);
  });

  test('persists a draft to localStorage as the form changes', async () => {
    vi.useFakeTimers();
    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    fireEvent.change(screen.getByLabelText(/report title/i), { target: { value: 'Travel' } });
    vi.advanceTimersByTime(400);

    expect(localStorage.getItem('claimit_expense_draft')).toContain('Travel');
  });

  test('restores a persisted draft from localStorage on load', async () => {
    localStorage.setItem(
      'claimit_expense_draft',
      JSON.stringify({
        reportTitle: 'Restored draft',
        description: 'Previous notes',
        entries: [
          {
            id: 'existing-entry',
            category: 'meals',
            date: '2026-07-20',
            amount: '200',
            currency: 'INR',
          },
        ],
      }),
    );

    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    expect(screen.getByDisplayValue('Restored draft')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Previous notes')).toBeInTheDocument();
  });

  test('prevents submission and shows validation errors for incomplete entries', async () => {
    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    await userEvent.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => {
      expect(mockSubmitExpenseReport).not.toHaveBeenCalled();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/please fix the errors above/i);
    await waitFor(() => {
      expect(screen.getByText('Category is required.')).toBeInTheDocument();
      expect(screen.getByText('Expense date is required.')).toBeInTheDocument();
      expect(screen.getByText('Amount is required.')).toBeInTheDocument();
      expect(screen.getByText('A receipt image is required.')).toBeInTheDocument();
    });
  });

  test('submits a valid report and clears the form', async () => {
    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    fireEvent.change(screen.getByLabelText(/report title/i), {
      target: { value: 'Quarterly travel' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Client visits' },
    });
    fireEvent.change(screen.getByLabelText(/category 1/i), { target: { value: 'travel' } });
    fireEvent.change(screen.getByLabelText(/date 1/i), { target: { value: '2026-07-21' } });
    fireEvent.change(screen.getByLabelText(/amount 1/i), { target: { value: '120' } });
    await userEvent.click(screen.getByRole('button', { name: /upload receipt/i }));

    await userEvent.click(screen.getByRole('button', { name: /submit report/i }));

    await waitFor(() => expect(mockSubmitExpenseReport).toHaveBeenCalledTimes(1));

    expect(mockSubmitExpenseReport).toHaveBeenCalledWith(
      expect.objectContaining({
        reportTitle: 'Quarterly travel',
        description: 'Client visits',
        entries: [
          expect.objectContaining({
            category: 'travel',
            date: '2026-07-21',
            amount: '120',
            receiptName: 'receipt.png',
          }),
        ],
      }),
    );
    expect(localStorage.getItem('claimit_expense_draft')).toBeNull();
    expect(screen.getByLabelText(/report title/i)).toHaveValue('');
  });

  test('shows policy warning messages for large expenses', async () => {
    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    fireEvent.change(screen.getByLabelText(/category 1/i), { target: { value: 'meals' } });
    fireEvent.change(screen.getByLabelText(/amount 1/i), { target: { value: '600' } });

    expect(screen.getAllByText(/exceeds policy limit/i).length).toBeGreaterThan(0);
  });

  test('updates the total amount shown for the report', async () => {
    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    fireEvent.change(screen.getByLabelText(/amount 1/i), { target: { value: '100' } });

    expect(screen.getByText('100.00 INR')).toBeInTheDocument();
  });

  test('disables the submit button while a submission is in progress', async () => {
    mockSubmitExpenseReport.mockImplementation(() => new Promise(() => {}));
    const ExpenseSubmission = await loadExpenseSubmission();
    renderExpenseSubmission(ExpenseSubmission);

    await userEvent.type(screen.getByLabelText(/category 1/i), 'travel');
    await userEvent.type(screen.getByLabelText(/date 1/i), '2026-07-21');
    await userEvent.type(screen.getByLabelText(/amount 1/i), '120');
    await userEvent.click(screen.getByRole('button', { name: /upload receipt/i }));

    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Submitting…');
  });
});
