import './CurrencyInput.css';

/**
 * Generic currency input scaffold for expense and reimbursement forms.
 *
 * @param {object} props
 * @param {string} [props.placeholder='Currency Input'] Placeholder text.
 * @returns {JSX.Element}
 */
const CurrencyInput = ({ placeholder = 'Currency Input', ...props }) => {
  return (
    <label className="currency-input">
      <span className="currency-input__label">Amount</span>
      <input type="text" placeholder={placeholder} className="currency-input__field" {...props} />
    </label>
  );
};

export default CurrencyInput;
