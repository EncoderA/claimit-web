import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import Table from './Table';

describe('Table', () => {
  test('renders the table wrapper and table content', () => {
    const { container } = render(
      <Table>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>$50</td>
            </tr>
          </tbody>
        </table>
      </Table>,
    );

    expect(container.querySelector('.table')).toHaveClass('table');
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('renders table headers and rows', () => {
    render(
      <Table>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>$50</td>
              <td>Approved</td>
            </tr>
            <tr>
              <td>$75</td>
              <td>Pending</td>
            </tr>
          </tbody>
        </table>
      </Table>,
    );

    expect(screen.getByRole('columnheader', { name: /amount/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  test('renders an empty state message when no data is provided', () => {
    render(<Table>No records found</Table>);

    expect(screen.getByText(/no records found/i)).toBeInTheDocument();
  });
});
