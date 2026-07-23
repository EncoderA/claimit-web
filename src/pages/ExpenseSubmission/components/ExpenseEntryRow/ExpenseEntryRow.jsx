import { CircleAlert, Trash2 } from 'lucide-react';
import { FormField, SelectField, Button, ReceiptUpload, DatePickerField } from '../../../../components';
import { EXPENSE_CATEGORIES, EXPENSE_CURRENCIES } from '../../../../constants/expense.constants';
import './ExpenseEntryRow.css';

/**
 * A single expense entry rendered as a card.
 * Contains category, date, amount, currency, receipt upload, and a remove button.
 * Displays inline validation errors and a policy warning strip when applicable.
 *
 * @param {object}    props
 * @param {object}    props.entry
 * @param {string}    props.entry.id
 * @param {string}    props.entry.category
 * @param {string}    props.entry.date
 * @param {string}    props.entry.amount
 * @param {string}    props.entry.currency
 * @param {File|null} props.entry.receipt
 * @param {number}    props.index
 * @param {object}    [props.errors]
 * @param {object}    [props.warnings]
 * @param {Function}  props.onChange
 * @param {Function}  props.onReceiptChange
 * @param {Function}  props.onReceiptRemove
 * @param {Function}  props.onRemove
 * @param {boolean}   [props.removable]
 */
const ExpenseEntryRow = ({
  entry,
  index,
  errors = {},
  warnings = {},
  onChange,
  onReceiptChange,
  onReceiptRemove,
  onRemove,
  removable = true,
}) => {
  const fieldId = (name) => `entry-${index}-${name}`;

  const handleChange = (field) => (e) => {
    onChange(entry.id, field, e.target.value);
  };

  const hasWarning = Object.keys(warnings).length > 0;

  return (
    <div className="expense-entry-row" role="group" aria-label={`Expense entry ${index + 1}`}>

      {/* ── Card header ── */}
      <div className="expense-entry-row__header">
        <div className="expense-entry-row__header-left">
          <span className="expense-entry-row__index-badge" aria-hidden="true">
            {index + 1}
          </span>
          <span className="expense-entry-row__label">Expense #{index + 1}</span>
        </div>
        <Button
          variant="danger"
          onClick={() => onRemove(entry.id)}
          disabled={!removable}
          aria-label={`Remove expense entry ${index + 1}`}
        >
          <Trash2 size={14} aria-hidden="true" />
          Remove
        </Button>
      </div>

      {/* ── Main fields grid ── */}
      <div className="expense-entry-row__body">
        <SelectField
          id={fieldId('category')}
          label="Category"
          required
          options={EXPENSE_CATEGORIES}
          placeholder="Select category"
          value={entry.category}
          onChange={handleChange('category')}
          error={errors.category}
        />

        <DatePickerField
          id={fieldId('date')}
          label="Expense Date"
          required
          value={entry.date}
          onChange={(dateString) => onChange(entry.id, 'date', dateString)}
          error={errors.date}
        />

        <FormField
          id={fieldId('amount')}
          label="Amount"
          required
          placeholder="0.00"
          value={entry.amount}
          onChange={handleChange('amount')}
          inputMode="decimal"
          error={errors.amount}
        />

        <SelectField
          id={fieldId('currency')}
          label="Currency"
          options={EXPENSE_CURRENCIES}
          value={entry.currency}
          onChange={handleChange('currency')}
        />
      </div>

      {/* ── Receipt upload ── */}
      <div className="expense-entry-row__bottom">
        <ReceiptUpload
          id={fieldId('receipt')}
          file={entry.receipt}
          onChange={(file) => onReceiptChange(entry.id, file)}
          onRemove={() => onReceiptRemove(entry.id)}
          error={errors.receipt}
        />
      </div>

      {/* ── Policy warning strip ── */}
      {hasWarning && (
        <div className="expense-entry-row__policy-warning" role="status">
          <CircleAlert size={15} aria-hidden="true" />
          {warnings.amount}
        </div>
      )}

    </div>
  );
};

export default ExpenseEntryRow;
