import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import StatusChip from './StatusChip';

describe('StatusChip', () => {
  test('renders the approved label correctly', () => {
    render(<StatusChip className="status-chip--approved">Approved</StatusChip>);

    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  test('renders the pending label correctly', () => {
    render(<StatusChip className="status-chip--pending">Pending</StatusChip>);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('renders the rejected label correctly', () => {
    render(<StatusChip className="status-chip--rejected">Rejected</StatusChip>);

    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  test('applies the expected status class', () => {
    render(<StatusChip className="status-chip--approved">Approved</StatusChip>);

    const chip = screen.getByText('Approved');

    expect(chip).toHaveClass('status-chip--approved');
  });
});
