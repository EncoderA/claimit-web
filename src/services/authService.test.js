import { describe, it, expect } from 'vitest';
import { loginRequest, refreshRequest, logoutRequest, resetPasswordRequest } from './authService';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mocks/server';

describe('services/authService.js', () => {
  it('loginRequest posts to /api/v1/auth/login and unwraps data', async () => {
    const data = await loginRequest('finance@claimit.com', 'password');
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
  });

  it('refreshRequest posts to /api/v1/auth/refresh with refreshToken payload', async () => {
    const data = await refreshRequest('valid-refresh-token');
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
  });

  it('logoutRequest posts to /api/v1/auth/logout', async () => {
    let logoutCalled = false;
    server.use(
      http.post('*/api/v1/auth/logout', () => {
        logoutCalled = true;
        return HttpResponse.json({ success: true, data: null });
      })
    );

    await logoutRequest();
    expect(logoutCalled).toBe(true);
  });

  it('CRITICAL INVARIANT TEST: resetPasswordRequest attaches custom Authorization: Bearer <passwordResetToken> header', async () => {
    let capturedAuthHeader = null;

    server.use(
      http.post('*/api/v1/auth/reset-password', ({ request }) => {
        capturedAuthHeader = request.headers.get('Authorization');
        return HttpResponse.json({
          success: true,
          message: 'Password reset successful',
          data: {
            accessToken: 'new-full-access-token',
            refreshToken: 'new-full-refresh-token',
          },
        });
      })
    );

    const tempToken = 'temp-password-reset-token-xyz';
    const resData = await resetPasswordRequest(tempToken, 'NewSecret@123');

    expect(capturedAuthHeader).toBe(`Bearer ${tempToken}`);
    expect(resData.accessToken).toBe('new-full-access-token');
  });
});
