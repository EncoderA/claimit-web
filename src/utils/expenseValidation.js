/**
 * Validation and policy-warning rules for expense entries.
 */

// Policy limits in INR.

const POLICY_LIMITS = {
  meals: 500,
  travel: 5000,
  accommodation: 10000,
};

/**
 * Validate a single expense entry.
 *
 * @param {object} entry
 * @returns {{ category?: string, date?: string, amount?: string, receipt?: string }}
 */
export const validateEntry = (entry) => {
  const errors = {};

  if (!entry.category) {
    errors.category = 'Category is required.';
  }

  if (!entry.date) {
    errors.date = 'Expense date is required.';
  }

  if (!entry.amount || entry.amount.toString().trim() === '') {
    errors.amount = 'Amount is required.';
  } else {
    const parsed = parseFloat(entry.amount);
    if (isNaN(parsed) || parsed <= 0) {
      errors.amount = 'Amount must be greater than 0.';
    }
  }

  if (!entry.receipt) {
    errors.receipt = 'A receipt image is required.';
  }

  return errors;
};

/**
 * Validate all entries in the form.
 *
 * @param {Array} entries
 * @returns {{ entryErrors: Object, isValid: boolean }}
 */
export const validateAllEntries = (entries) => {
  const entryErrors = {};
  let isValid = true;

  entries.forEach((entry) => {
    const errors = validateEntry(entry);
    if (Object.keys(errors).length > 0) {
      entryErrors[entry.id] = errors;
      isValid = false;
    }
  });

  return { entryErrors, isValid };
};

/**
 * Check a single entry against policy limits.
 * Warnings do not block submission.
 *
 * @param {object} entry
 * @returns {{ amount?: string }}
 */
export const getPolicyWarnings = (entry) => {
  const warnings = {};
  const limit = POLICY_LIMITS[entry.category];

  if (!limit) return warnings;

  const parsed = parseFloat(entry.amount);
  if (!isNaN(parsed) && parsed > limit) {
    warnings.amount = `Exceeds policy limit of ₹${limit.toLocaleString('en-IN')} for this category.`;
  }

  return warnings;
};

/**
 * Compute policy warnings for all entries.
 *
 * @param {Array} entries
 * @returns {Object}
 */
export const getAllPolicyWarnings = (entries) => {
  const allWarnings = {};

  entries.forEach((entry) => {
    const warnings = getPolicyWarnings(entry);
    if (Object.keys(warnings).length > 0) {
      allWarnings[entry.id] = warnings;
    }
  });

  return allWarnings;
};
