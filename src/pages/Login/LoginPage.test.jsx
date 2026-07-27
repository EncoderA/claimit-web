import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('pages/Login/LoginPage.jsx', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    mockLogin.mockReset();
    useAuth.mockReturnValue({
      user: null,
      login: mockLogin,
    });
  });

  it('renders login form inputs and submit button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('displays error message when login rejects with API error', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid email or password.'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'user@claimit.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('redirects to /reset-password when login returns passwordResetRequired: true', async () => {
    mockLogin.mockResolvedValue({ passwordResetRequired: true });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<div>Reset Password Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'firstlogin@claimit.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Temp@123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Reset Password Screen')).toBeInTheDocument();
    });
  });

  it('populates credentials when dev-helper quick login button clicked', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const financeBtn = screen.getByRole('button', { name: 'Finance' });
    fireEvent.click(financeBtn);

    expect(screen.getByLabelText('Email Address')).toHaveValue('finance@claimit.com');
    expect(screen.getByLabelText('Password')).toHaveValue('password');
  });
});
