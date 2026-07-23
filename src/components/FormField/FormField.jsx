import { CircleAlert } from 'lucide-react';
import './FormField.css';

/**
 * Generic form field component supporting text inputs and textareas.
 * Used across forms in ClaimIt for labelled, controlled inputs.
 *
 * @param {object}  props
 * @param {string}  props.id            - Associates the label with the input (required for accessibility).
 * @param {string}  props.label         - Visible label text.
 * @param {boolean} [props.required]    - Appends a required marker to the label when true.
 * @param {'input'|'textarea'} [props.as='input'] - Renders an input or a textarea.
 * @param {string}  [props.placeholder] - Placeholder text.
 * @param {string}  props.value         - Controlled value.
 * @param {Function} props.onChange     - Change handler.
 * @param {string}  [props.error]       - Inline validation error message.
 * @param {string}  [props.warning]     - Inline policy warning message.
 * @returns {JSX.Element}
 */
const FormField = ({
  id,
  label,
  required = false,
  as = 'input',
  placeholder = '',
  value,
  onChange,
  error,
  warning,
  ...props
}) => {
  const labelClass = `form-field__label${required ? ' form-field__label--required' : ''}`;

  let fieldClass = as === 'textarea' ? 'form-field__textarea' : 'form-field__input';
  if (error)   fieldClass += ' form-field__input--error';
  if (warning && !error) fieldClass += ' form-field__input--warning';

  return (
    <div className="form-field">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          className={fieldClass}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
          {...props}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={fieldClass}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
          {...props}
        />
      )}
      {error && (
        <span id={`${id}-error`} className="form-field__message form-field__message--error" role="alert">
          <CircleAlert size={12} aria-hidden="true" />
          {error}
        </span>
      )}
      {warning && !error && (
        <span id={`${id}-warning`} className="form-field__message form-field__message--warning">
          <CircleAlert size={12} aria-hidden="true" />
          {warning}
        </span>
      )}
    </div>
  );
};

export default FormField;
