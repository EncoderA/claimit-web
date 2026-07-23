/**
 * Expense service — placeholder methods for future backend integration.
 * All functions currently operate locally and log intent to the console.
 * Replace the function bodies with real API calls once the backend is available.
 */

/**
 * Submits a completed expense report to the backend.
 *
 * @param {object} report - The full expense report payload.
 * @param {string} report.reportTitle
 * @param {string} report.description
 * @param {Array}  report.entries
 * @returns {Promise<void>}
 *
 * TODO: Replace with POST /api/v1/expense-reports
 */
export async function submitExpenseReport(report) {
  // TODO: await axiosInstance.post('/api/v1/expense-reports', report);
  console.log('[expenseService] submitExpenseReport — payload:', report);
}

/**
 * Saves the current form state as a server-side draft.
 * Complements the local localStorage draft for cross-device persistence.
 *
 * @param {object} draft - Partial or complete expense report data.
 * @returns {Promise<void>}
 *
 * TODO: Replace with POST /api/v1/expense-reports/drafts
 */
export async function saveDraft(draft) {
  // TODO: await axiosInstance.post('/api/v1/expense-reports/drafts', draft);
  console.log('[expenseService] saveDraft — payload:', draft);
}

/**
 * Uploads a receipt image for a specific expense entry.
 * Returns the stored file URL or reference once the backend is available.
 *
 * @param {string} entryId - The expense entry the receipt belongs to.
 * @param {File}   file    - The image file to upload.
 * @returns {Promise<string|null>} Resolves to the receipt URL, or null locally.
 *
 * TODO: Replace with POST /api/v1/expense-reports/receipts (multipart/form-data)
 */
export async function uploadReceipt(entryId, file) {
  // TODO: const formData = new FormData();
  // TODO: formData.append('entryId', entryId);
  // TODO: formData.append('file', file);
  // TODO: const { data } = await axiosInstance.post('/api/v1/expense-reports/receipts', formData);
  // TODO: return data.url;
  console.log('[expenseService] uploadReceipt — entryId:', entryId, 'file:', file?.name);
  return null;
}
