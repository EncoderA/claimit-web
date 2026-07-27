import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PayoutBatchesPage from './PayoutBatchesPage';
import * as financeService from '../../services/financeService';

describe('pages/Finance/PayoutBatchesPage.jsx', () => {
  it('renders batches list from service', async () => {
    render(
      <MemoryRouter>
        <PayoutBatchesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('PB-0044')).toBeInTheDocument();
    expect(screen.getByText('₹1,84,200')).toBeInTheDocument();
  });

  it('REGRESSION TEST: Export CSV triggers export service with batch ID', async () => {
    const exportSpy = vi.spyOn(financeService, 'exportBatchCSV').mockResolvedValue(
      new Blob(['Batch ID,Total\nPB-0044,184200'], { type: 'text/csv' })
    );
    vi.spyOn(financeService, 'downloadBlobAsFile').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <PayoutBatchesPage />
      </MemoryRouter>
    );

    const exportBtns = await screen.findAllByText('Export CSV');
    fireEvent.click(exportBtns[0]);

    await waitFor(() => {
      expect(exportSpy).toHaveBeenCalledWith('PB-0044');
    });

    exportSpy.mockRestore();
  });
});
