import { describe, it, expect, vi } from 'vitest';
import {
  getBatchReviewReports,
  getPayoutBatches,
  createPayoutBatch,
  exportBatchCSV,
  downloadBlobAsFile,
} from './financeService';

describe('services/financeService.js', () => {
  it('getBatchReviewReports returns all items when no filters applied', async () => {
    const reports = await getBatchReviewReports();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toHaveProperty('id');
    expect(reports[0]).toHaveProperty('reportTitle');
  });

  it('getBatchReviewReports filters by department', async () => {
    const salesReports = await getBatchReviewReports({ dept: 'Sales' });
    expect(salesReports.every((r) => r.dept === 'Sales')).toBe(true);
  });

  it('getBatchReviewReports filters by min and max amount boundaries (inclusive)', async () => {
    // EXP-1182 amount is 3200
    const bounded = await getBatchReviewReports({ minAmount: 3200, maxAmount: 3200 });
    expect(bounded.some((r) => r.id === 'EXP-1182')).toBe(true);
    expect(bounded.every((r) => r.amount === 3200)).toBe(true);
  });

  it('getBatchReviewReports filters by max risk score', async () => {
    const lowRisk = await getBatchReviewReports({ maxRisk: 10 });
    expect(lowRisk.every((r) => r.riskScore <= 10)).toBe(true);
  });

  it('getPayoutBatches returns initial list of payout batches', async () => {
    const batches = await getPayoutBatches();
    expect(batches.length).toBeGreaterThan(0);
    expect(batches[0]).toHaveProperty('batchId');
    expect(batches[0]).toHaveProperty('status');
  });

  it('createPayoutBatch creates a new batch, removes selected reports from review queue, and returns batch details', async () => {
    const initialQueue = await getBatchReviewReports();
    const targetIds = [initialQueue[0].id, initialQueue[1].id];
    const expectedSum = initialQueue[0].amount + initialQueue[1].amount;

    const newBatch = await createPayoutBatch(targetIds);

    expect(newBatch).not.toBeNull();
    expect(newBatch.reportsCount).toBe(2);
    expect(newBatch.totalAmount).toBe(expectedSum);
    expect(newBatch.status).toBe('PROCESSING');

    // Confirm items removed from review queue
    const updatedQueue = await getBatchReviewReports();
    expect(updatedQueue.some((r) => targetIds.includes(r.id))).toBe(false);
  });

  it('exportBatchCSV generates a CSV Blob with headers and content', async () => {
    const blob = await exportBatchCSV('PB-0044');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain('text/csv');

    const text = await blob.text();
    expect(text).toContain('Batch ID,Reports Count,Total Amount (INR)');
    expect(text).toContain('PB-0044');
  });

  it('downloadBlobAsFile creates an object URL and triggers download link click', () => {
    const createURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock');
    const revokeURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const realAnchor = document.createElement('a');
    const clickSpy = vi.spyOn(realAnchor, 'click').mockImplementation(() => {});
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(realAnchor);

    const testBlob = new Blob(['test content'], { type: 'text/plain' });
    downloadBlobAsFile(testBlob, 'test_download.csv');

    expect(createURLSpy).toHaveBeenCalledWith(testBlob);
    expect(realAnchor.getAttribute('download')).toBe('test_download.csv');
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeURLSpy).toHaveBeenCalledWith('blob:http://localhost/mock');

    createURLSpy.mockRestore();
    revokeURLSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});
