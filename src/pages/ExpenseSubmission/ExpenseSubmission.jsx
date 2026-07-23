import { useState, useMemo } from 'react';
import { FileText, ListChecks, CheckCircle, CircleAlert, Plus, SaveIcon } from 'lucide-react';
import { FormField, Button } from '../../components';
import ExpenseEntryRow from './components/ExpenseEntryRow/ExpenseEntryRow';
import useLocalStorageDraft, { readDraft } from '../../hooks/useLocalStorageDraft';
import { validateAllEntries, getAllPolicyWarnings } from '../../utils/expenseValidation';
import { formatAmount, parseAmount } from '../../utils/formatAmount';
import { submitExpenseReport } from '../../services/expenseService';
import { DEFAULT_CURRENCY, EXPENSE_DRAFT_STORAGE_KEY } from '../../constants/expense.constants';
import './ExpenseSubmission.css';

/**
 * Creates a blank expense entry with a unique ID and sensible defaults.
 * @returns {object} A new expense entry object.
 */
const createEmptyEntry = () => ({
  id: crypto.randomUUID(),
  category: '',
  date: '',
  amount: '',
  currency: DEFAULT_CURRENCY,
  receipt: null,
});

const serializeDraft = ({ reportTitle, description, entries }) => ({
  reportTitle,
  description,
  entries: entries.map(({ receipt: _receipt, ...rest }) => rest),
});

const deserializeDraft = (raw) => ({
  reportTitle: raw.reportTitle ?? '',
  description: raw.description ?? '',
  entries:
    Array.isArray(raw.entries) && raw.entries.length > 0
      ? raw.entries.map((entry) => ({ ...entry, receipt: null }))
      : [createEmptyEntry()],
});

const savedDraft = readDraft(EXPENSE_DRAFT_STORAGE_KEY, deserializeDraft);

const initialState = savedDraft ?? {
  reportTitle: '',
  description: '',
  entries: [createEmptyEntry()],
};

/**
 * ExpenseSubmission page.
 * Allows employees to create and submit an expense report.
 *
 * Features: report details, multi-line expense entries, receipt upload,
 * localStorage draft persistence, inline validation, policy warnings, submission.
 */
const ExpenseSubmission = () => {
  const [reportTitle, setReportTitle] = useState(initialState.reportTitle);
  const [description, setDescription] = useState(initialState.description);
  const [entries, setEntries]         = useState(initialState.entries);

  const [entryErrors, setEntryErrors]   = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { clearDraft } = useLocalStorageDraft(
    EXPENSE_DRAFT_STORAGE_KEY,
    { reportTitle, description, entries },
    { serialize: serializeDraft }
  );

  const entryWarnings = useMemo(() => getAllPolicyWarnings(entries), [entries]);

  /**
   * Report totals grouped by currency.
   * Entries with different currencies are summed separately — no conversion.
   * Each element: { currency: string, total: number }
   */
  const reportTotals = useMemo(() => {
    const map = {};
    entries.forEach(({ amount, currency }) => {
      const key = currency || DEFAULT_CURRENCY;
      map[key] = (map[key] ?? 0) + parseAmount(amount);
    });
    return Object.entries(map).map(([currency, total]) => ({ currency, total }));
  }, [entries]);

  /** Update a single field on a specific entry row, clearing its error on change. */
  const handleEntryChange = (id, field, value) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
    setEntryErrors((prev) => {
      if (!prev[id]?.[field]) return prev;
      const rowErrors = { ...prev[id] };
      delete rowErrors[field];
      return { ...prev, [id]: rowErrors };
    });
  };

  /** Store a selected File object on the matching entry row, clearing its receipt error. */
  const handleReceiptChange = (id, file) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, receipt: file } : entry))
    );
    setEntryErrors((prev) => {
      if (!prev[id]?.receipt) return prev;
      const rowErrors = { ...prev[id] };
      delete rowErrors.receipt;
      return { ...prev, [id]: rowErrors };
    });
  };

  /** Clear the receipt File from the matching entry row. */
  const handleReceiptRemove = (id) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, receipt: null } : entry))
    );
  };

  /** Append a new blank entry row. */
  const handleAddEntry = () => {
    setEntries((prev) => [...prev, createEmptyEntry()]);
  };

  /** Remove an entry row by its ID, also clearing its errors. */
  const handleRemoveEntry = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    setEntryErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSubmit = async () => {
    const { entryErrors: errors, isValid } = validateAllEntries(entries);

    if (!isValid) {
      setEntryErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const report = {
      reportTitle,
      description,
      submittedAt: new Date().toISOString(),
      entries: entries.map(({ receipt, ...rest }) => ({
        ...rest,
        receiptName: receipt?.name ?? null,
      })),
    };

    try {
      await submitExpenseReport(report);
      clearDraft();

      setReportTitle('');
      setDescription('');
      setEntries([createEmptyEntry()]);
      setEntryErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(entryErrors).some(
    (id) => Object.keys(entryErrors[id] ?? {}).length > 0
  );

  const totalWarnings = Object.keys(entryWarnings).length;

  return (
    <div className="expense-submission-page">

      {/* ── Page header ── */}
      <header className="expense-submission-page__header">
        <h1 className="expense-submission-page__title">Expense Submission</h1>
        <p className="expense-submission-page__subtitle">
          Create and submit employee expense reports for reimbursement.
        </p>
      </header>

      {/* ── Report Details section ── */}
      <div className="expense-submission__section-card">
        <div className="expense-submission__section-header">
          <span className="expense-submission__section-icon" aria-hidden="true">
            <FileText size={16} />
          </span>
          <h2 className="expense-submission__section-title">Report Details</h2>
        </div>

        <div className="expense-submission__section-body">
          <FormField
            id="report-title"
            label="Report Title"
            required
            placeholder="e.g. Q3 Business Travel – London"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
          />

          <FormField
            id="description"
            label="Description"
            as="textarea"
            placeholder="Provide a brief summary of this expense report…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* ── Expense Entries section ── */}
      <div className="expense-submission__section-card">
        <div className="expense-submission__section-header">
          <span className="expense-submission__section-icon" aria-hidden="true">
            <ListChecks size={16} />
          </span>
          <h2 className="expense-submission__section-title">Expense Entries</h2>
        </div>

        <div className="expense-submission__section-body">
          <div className="expense-submission__entries">
            {entries.map((entry, index) => (
              <ExpenseEntryRow
                key={entry.id}
                entry={entry}
                index={index}
                errors={entryErrors[entry.id] ?? {}}
                warnings={entryWarnings[entry.id] ?? {}}
                onChange={handleEntryChange}
                onReceiptChange={handleReceiptChange}
                onReceiptRemove={handleReceiptRemove}
                onRemove={handleRemoveEntry}
                removable={entries.length > 1}
              />
            ))}
          </div>

          <div className="expense-submission__add-entry">
            <Button variant="ghost" onClick={handleAddEntry}>
              <Plus size={15} aria-hidden="true" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* ── Report Total ── */}
      <div className="expense-submission__section-card expense-submission__total-card">
        <div className="expense-submission__total-body">
          <span className="expense-submission__total-label">Report Total</span>
          <span className="expense-submission__total-values" aria-live="polite" aria-atomic="true">
            {reportTotals.map(({ currency, total }) => (
              <span key={currency} className="expense-submission__total-value">
                {formatAmount(total, currency)}
              </span>
            ))}
          </span>
        </div>
        {reportTotals.length > 1 && (
          <p className="expense-submission__total-note">
            Amounts shown per currency — no conversion applied.
          </p>
        )}
      </div>

      {/* ── Actions section ── */}
      <div className="expense-submission__section-card expense-submission__section-card--actions">
        <div className="expense-submission__footer-body">
          <div className="expense-submission__footer-notices">
            {totalWarnings > 0 && (
              <div className="expense-submission__warning-banner" role="status">
                <CircleAlert size={15} aria-hidden="true" />
                <span>
                  {totalWarnings === 1
                    ? '1 expense exceeds policy limits. You may still submit.'
                    : `${totalWarnings} expenses exceed policy limits. You may still submit.`}
                </span>
              </div>
            )}

            {hasErrors && (
              <div className="expense-submission__error-banner" role="alert">
                <CircleAlert size={15} aria-hidden="true" />
                <span>Please fix the errors above before submitting.</span>
              </div>
            )}
          </div>

          <div className="expense-submission__footer-actions">
            <Button variant="ghost" onClick={() => {}}>
              <SaveIcon size={15} aria-hidden="true" />
              Save Draft
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <CheckCircle size={15} aria-hidden="true" />
              {isSubmitting ? 'Submitting…' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExpenseSubmission;
