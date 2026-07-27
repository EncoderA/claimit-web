import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('pages/Login/ResetPasswordPage.jsx', () => {
  const mockHandlePasswordResetSuccess = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    mockHandlePasswordResetSuccess.mockReset();
    useAuth.mockReturnValue({
      user: null,
      handlePasswordResetSuccess: mockHandlePasswordResetSuccess,
    });
  });

  it('redirects to /login if claimit_password_reset_token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/login" element={<div>Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
  });

  it('displays validation error if passwords do not match', async () => {
    sessionStorage.setItem('claimit_password_reset_token', 'mock-reset-token');

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'DifferentPass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password & Enter App' }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('displays validation error if password length < 8', async () => {
    sessionStorage.setItem('claimit_password_reset_token', 'mock-reset-token');

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password & Enter App' }));

    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('successful reset calls resetPasswordRequest and handlePasswordResetSuccess', async () => {
    sessionStorage.setItem('claimit_password_reset_token', 'valid-token-123');

    const resetSpy = vi.spyOn(authService, 'resetPasswordRequest').mockResolvedValue({
      accessToken: 'acc-123',
      refreshToken: 'ref-123',
    });
    mockHandlePasswordResetSuccess.mockReturnValue({ role: 'EMPLOYEE' });

    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/employee" element={<div>Employee Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'ValidPass123!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'ValidPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password & Enter App' }));

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith('valid-token-123', 'ValidPass123!');
      expect(mockHandlePasswordResetSuccess).toHaveBeenCalledWith('acc-123', 'ref-123');
      expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
    });

    resetSpy.mockRestore();
  });
});
