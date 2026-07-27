import { describe, it, expect, vi } from 'vitest';
import { submitExpenseReport, saveDraft, uploadReceipt } from './expenseService';

describe('services/expenseService.js', () => {
  it('submitExpenseReport logs payload', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const payload = { reportTitle: 'Offsite', description: 'Team offsite', entries: [] };

    await submitExpenseReport(payload);
    expect(consoleSpy).toHaveBeenCalledWith('[expenseService] submitExpenseReport — payload:', payload);

    consoleSpy.mockRestore();
  });

  it('saveDraft logs draft payload', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const draft = { reportTitle: 'Draft Title' };

    await saveDraft(draft);
    expect(consoleSpy).toHaveBeenCalledWith('[expenseService] saveDraft — payload:', draft);

    consoleSpy.mockRestore();
  });

  it('uploadReceipt handles receipt file upload stub', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const file = new File(['dummy content'], 'receipt.jpg', { type: 'image/jpeg' });

    const result = await uploadReceipt('entry-101', file);
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('[expenseService] uploadReceipt — entryId:', 'entry-101', 'file:', 'receipt.jpg');

    consoleSpy.mockRestore();
  });
});
