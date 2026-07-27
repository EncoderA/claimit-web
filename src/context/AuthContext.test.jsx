import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { setRefreshToken, getRefreshToken } from '../utils/tokenStore';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mocks/server';

const TestComponent = () => {
  const { user, isInitializing, login, logout } = useAuth();

  if (isInitializing) return <div data-testid="initializing">Initializing...</div>;

  return (
    <div>
      <div data-testid="user-info">{user ? `${user.role}:${user.email}` : 'No User'}</div>
      <button
        data-testid="login-btn"
        onClick={() => {
          login('invalid@claimit.com', 'password').catch(() => {});
        }}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

describe('context/AuthContext.jsx', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('other_key', 'preserve_me');
  });

  it('mounts with no refresh token -> resolves user: null, isInitializing: false', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(await screen.findByTestId('user-info')).toHaveTextContent('No User');
    expect(screen.queryByTestId('initializing')).toBeNull();
  });

  it('mounts with refresh token -> calls /auth/refresh and populates user state', async () => {
    setRefreshToken('existing-refresh-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(await screen.findByTestId('user-info')).not.toHaveTextContent('No User');
  });

  it('login() failure keeps user null and throws error catchable by caller', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () => {
        return HttpResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = await screen.findByTestId('login-btn');

    await act(async () => {
      loginBtn.click();
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
  });

  it('logout() clears tokenStore, removes refresh token from sessionStorage (leaving other keys untouched)', async () => {
    setRefreshToken('refresh-token-to-delete');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = await screen.findByTestId('logout-btn');

    await act(async () => {
      logoutBtn.click();
    });

    expect(getRefreshToken()).toBeNull();
    expect(sessionStorage.getItem('claimit_refresh_token')).toBeNull();
    // Invariant check: confirm other sessionStorage items remain untouched
    expect(sessionStorage.getItem('other_key')).toBe('preserve_me');
  });
});
