/**
 * Expense category options used in the expense entry form.
 */
export const EXPENSE_CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'meals', label: 'Meals & Entertainment' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'training', label: 'Training & Conferences' },
  { value: 'communication', label: 'Communication' },
  { value: 'other', label: 'Other' },
];

/**
 * Supported currency options for expense entries.
 * Default currency is INR.
 */
export const EXPENSE_CURRENCIES = [
  { value: 'INR', label: 'INR – Indian Rupee' },
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'AED', label: 'AED – UAE Dirham' },
  { value: 'SGD', label: 'SGD – Singapore Dollar' },
];

export const DEFAULT_CURRENCY = 'INR';

/** localStorage key used to persist expense submission drafts. */
export const EXPENSE_DRAFT_STORAGE_KEY = 'claimit_expense_draft';
