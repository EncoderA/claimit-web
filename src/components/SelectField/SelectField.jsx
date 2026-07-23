import { CircleAlert } from 'lucide-react';
import './SelectField.css';

/**
 * Generic select (dropdown) field for use across ClaimIt forms.
 *
 * @param {object}   props
 * @param {string}   props.id               - Associates the label with the select (required for accessibility).
 * @param {string}   props.label            - Visible label text.
 * @param {boolean}  [props.required]       - Appends a required marker to the label when true.
 * @param {Array<{value: string, label: string}>} props.options - Dropdown options.
 * @param {string}   props.value            - Controlled selected value.
 * @param {Function} props.onChange         - Change handler.
 * @param {string}   [props.placeholder]    - Disabled default option shown when no value is selected.
 * @param {string}   [props.error]          - Inline validation error message.
 * @param {string}   [props.warning]        - Inline policy warning message.
 * @returns {JSX.Element}
 */
const SelectField = ({
  id,
  label,
  required = false,
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  error,
  warning,
  ...props
}) => {
  const labelClass = `select-field__label${required ? ' select-field__label--required' : ''}`;

  let selectClass = 'select-field__select';
  if (error)            selectClass += ' select-field__select--error';
  if (warning && !error) selectClass += ' select-field__select--warning';

  return (
    <div className="select-field">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select
        id={id}
        className={selectClass}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${id}-error`} className="select-field__message select-field__message--error" role="alert">
          <CircleAlert size={12} aria-hidden="true" />
          {error}
        </span>
      )}
      {warning && !error && (
        <span id={`${id}-warning`} className="select-field__message select-field__message--warning">
          <CircleAlert size={12} aria-hidden="true" />
          {warning}
        </span>
      )}
    </div>
  );
};

export default SelectField;
