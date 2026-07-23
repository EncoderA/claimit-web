/**
 * Parses an amount string/number and formats it for display.
 * Returns a locale-formatted number string with the currency code suffix.
 *
 * Invalid, empty, or NaN values are treated as 0 and never throw.
 *
 * @param {string|number} value    - Raw amount value (may be a partial user input string).
 * @param {string}        currency - ISO 4217 currency code, e.g. 'INR', 'USD'.
 * @returns {string}               - e.g. "1,234.50 INR"
 */
export function formatAmount(value, currency = '') {
  const numeric = parseFloat(value);
  const safe = isNaN(numeric) || numeric < 0 ? 0 : numeric;

  const formatted = safe.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency ? `${formatted} ${currency}` : formatted;
}

/**
 * Safely parses a raw amount value to a finite number.
 * Returns 0 for empty, invalid, or negative inputs.
 *
 * @param {string|number} value
 * @returns {number}
 */
export function parseAmount(value) {
  const numeric = parseFloat(value);
  return isNaN(numeric) || numeric < 0 ? 0 : numeric;
}
