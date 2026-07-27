import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BatchReviewPage from './BatchReviewPage';

describe('pages/Finance/BatchReviewPage.jsx', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <BatchReviewPage />
      </MemoryRouter>
    );
  });

  it('renders queue items fetched from mock service', async () => {
    expect(await screen.findByText('Team offsite supplies')).toBeInTheDocument();
    expect(screen.getByText('Airport cab - quarterly review')).toBeInTheDocument();
  });

  it('filters by department correctly', async () => {
    await screen.findByText('Team offsite supplies');

    const deptSelect = screen.getByLabelText('Department');
    fireEvent.change(deptSelect, { target: { value: 'Sales' } });

    await waitFor(() => {
      expect(screen.getByText('Airport cab - quarterly review')).toBeInTheDocument();
      expect(screen.queryByText('Team offsite supplies')).toBeNull();
    });
  });

  it('filters by min/max amount with boundary value inclusion', async () => {
    await screen.findByText('Team offsite supplies'); // Amount: 3200

    const minInput = screen.getByPlaceholderText('0');
    fireEvent.change(minInput, { target: { value: '3200' } }); // Boundary test: exactly 3200

    await waitFor(() => {
      expect(screen.getByText('Team offsite supplies')).toBeInTheDocument();
      expect(screen.queryByText('Airport cab - quarterly review')).toBeNull(); // Amount: 850
    });
  });

  it('filters by max risk score correctly', async () => {
    await screen.findByText('Team offsite supplies');

    const riskInput = screen.getByPlaceholderText('100');
    fireEvent.change(riskInput, { target: { value: '10' } }); // Max risk 10

    await waitFor(() => {
      expect(screen.getByText('Airport cab - quarterly review')).toBeInTheDocument(); // Risk 6
      expect(screen.queryByText('Team offsite supplies')).toBeNull(); // Risk 12
    });
  });

  it('SELECTION PERSISTENCE: selecting rows and changing filters keeps hidden items in selection set', async () => {
    await screen.findByText('Team offsite supplies');

    const checkboxes = screen.getAllByRole('checkbox');
    // Select first row (Team offsite supplies - Engineering)
    fireEvent.click(checkboxes[1]);

    await waitFor(() => {
      const selectionCount = document.querySelector('.selection-count');
      expect(selectionCount?.textContent).toMatch(/1\s*report\s*selected/i);
    });

    // Change filter to Sales (which hides Engineering items)
    const deptSelect = screen.getByLabelText('Department');
    fireEvent.change(deptSelect, { target: { value: 'Sales' } });

    await waitFor(() => {
      const selectionCount = document.querySelector('.selection-count');
      expect(selectionCount?.textContent).toMatch(/1\s*report\s*selected/i);
      expect(screen.getByText(/\(1 not shown by current filters\)/i)).toBeInTheDocument();
    });
  });

  it('zero selection guard: Create Payout Batch button does not appear without selection', async () => {
    await screen.findByText('Team offsite supplies');
    expect(screen.queryByText('Create Payout Batch')).toBeNull();
  });
});
