import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('components/Sidebar/Sidebar.jsx', () => {
  it('renders null if user is null', () => {
    useAuth.mockReturnValue({ user: null });
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders EMPLOYEE nav items for employee role', () => {
    useAuth.mockReturnValue({ user: { role: 'EMPLOYEE' } });
    render(
      <MemoryRouter initialEntries={['/employee']}>
        <Sidebar />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Employee Dashboard' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/employee');
    expect(link).toHaveClass('active');
  });

  it('renders FINANCE nav items (including disabled placeholders) for finance role', () => {
    useAuth.mockReturnValue({ user: { role: 'FINANCE' } });
    render(
      <MemoryRouter initialEntries={['/finance/batch-review']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Batch Review' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'Payout Batches' })).toBeInTheDocument();

    // Confirm disabled placeholders rendered as spans with disabled class
    const disabledLink = screen.getByText('Spend Analytics');
    expect(disabledLink.tagName.toLowerCase()).toBe('span');
    expect(disabledLink).toHaveClass('sidebar-link', 'disabled');
  });

  it('renders ADMIN nav items for admin role', () => {
    useAuth.mockReturnValue({ user: { role: 'ADMIN' } });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Admin Dashboard' })).toBeInTheDocument();
  });
});
