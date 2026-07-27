import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import Card from './Card';

describe('Card', () => {
  test('renders successfully', () => {
    const { container } = render(<Card />);

    expect(container.firstChild).toHaveClass('card');
  });

  test('renders children', () => {
    render(<Card><p>Expense summary</p></Card>);

    expect(screen.getByText(/expense summary/i)).toBeInTheDocument();
  });

  test('renders the provided title', () => {
    render(<Card title="Reimbursement" />);

    expect(screen.getByText('Reimbursement')).toBeInTheDocument();
  });

  test('applies the expected wrapper class', () => {
    const { container } = render(<Card title="Summary">Body</Card>);

    expect(container.querySelector('.card')).toHaveClass('card');
  });
});
