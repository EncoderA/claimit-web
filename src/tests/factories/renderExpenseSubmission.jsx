import { render } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Renders ExpenseSubmission.
 * The component is dynamically imported by the test suite to ensure module-level
 * localStorage state is fresh for each test (vi.resetModules() pattern).
 * This factory wraps the render call to keep test files clean.
 *
 * Usage:
 *   const ExpenseSubmission = await loadExpenseSubmission();
 *   const result = renderExpenseSubmission(ExpenseSubmission);
 *
 * @param {React.ComponentType} ExpenseSubmission - The dynamically imported component.
 * @returns {ReturnType<typeof render>}
 */
export function renderExpenseSubmission(ExpenseSubmission) {
  return render(<ExpenseSubmission />);
}

/**
 * Dynamically imports ExpenseSubmission after resetting the module registry.
 * Ensures localStorage-derived module-level state is re-evaluated each time.
 *
 * @returns {Promise<React.ComponentType>}
 */
export async function loadExpenseSubmission() {
  vi.resetModules();
  const { default: ExpenseSubmission } = await import(
    '../../pages/ExpenseSubmission/ExpenseSubmission'
  );
  return ExpenseSubmission;
}
