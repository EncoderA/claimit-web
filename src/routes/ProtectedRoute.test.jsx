import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/roles.config';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('routes/ProtectedRoute.jsx', () => {
  it('isInitializing: true -> renders nothing (prevents premature redirect)', () => {
    useAuth.mockReturnValue({
      user: null,
      isInitializing: true,
      logout: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/employee']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
            <Route path="/employee" element={<div>Employee Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('unauthenticated -> redirects to /login', () => {
    useAuth.mockReturnValue({
      user: null,
      isInitializing: false,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/employee']}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
            <Route path="/employee" element={<div>Employee Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
  });

  it('allowed role -> renders nested route content', () => {
    useAuth.mockReturnValue({
      user: { id: '1', role: ROLES.EMPLOYEE },
      isInitializing: false,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/employee']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
            <Route path="/employee" element={<div>Employee Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Employee Content')).toBeInTheDocument();
  });

  it('REGRESSION TEST: user has wrong role -> redirects to /unauthorized and does NOT call logout()', () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      user: { id: '1', role: ROLES.EMPLOYEE }, // Employee trying to access Admin
      isInitializing: false,
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    // Invariant check: logout() must NOT be called on unauthorized navigation
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
