import { describe, it, expect, beforeEach } from 'vitest';
import axiosInstance from './axiosInstance';
import { setAccessToken, setRefreshToken } from '../utils/tokenStore';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mocks/server';

describe('services/axiosInstance.js Interceptors', () => {
  beforeEach(() => {
    setAccessToken(null);
    setRefreshToken(null);
  });

  it('attaches Authorization: Bearer <token> when access token exists', async () => {
    setAccessToken('valid-bearer-token');
    let capturedHeader = null;

    server.use(
      http.get('*/api/v1/test-protected', ({ request }) => {
        capturedHeader = request.headers.get('Authorization');
        return HttpResponse.json({ success: true, data: 'protected data' });
      })
    );

    const res = await axiosInstance.get('/api/v1/test-protected');
    expect(capturedHeader).toBe('Bearer valid-bearer-token');
    expect(res.data).toBe('protected data'); // Envelope unwrapped in response.data
  });

  it('does NOT overwrite an already-set Authorization header (reset-password flow protection)', async () => {
    setAccessToken('in-memory-token');
    let capturedHeader = null;

    server.use(
      http.post('*/api/v1/auth/reset-password', ({ request }) => {
        capturedHeader = request.headers.get('Authorization');
        return HttpResponse.json({ success: true, data: { accessToken: 'a', refreshToken: 'b' } });
      })
    );

    await axiosInstance.post(
      '/api/v1/auth/reset-password',
      { newPassword: 'Pass1234!' },
      { headers: { Authorization: 'Bearer custom-reset-token' } }
    );

    expect(capturedHeader).toBe('Bearer custom-reset-token');
  });

  it('unwraps envelope on 2xx responses (res.data = envelope.data)', async () => {
    server.use(
      http.get('*/api/v1/envelope-test', () => {
        return HttpResponse.json({
          success: true,
          message: 'Success',
          data: { foo: 'bar' },
        });
      })
    );

    const res = await axiosInstance.get('/api/v1/envelope-test');
    expect(res.data).toEqual({ foo: 'bar' });
  });

  it('builds standardized ApiError object on envelope success: false or HTTP non-2xx', async () => {
    server.use(
      http.get('*/api/v1/error-test', () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'Validation failed',
            validationErrors: [{ field: 'email', message: 'invalid email' }],
          },
          { status: 400 }
        );
      })
    );

    try {
      await axiosInstance.get('/api/v1/error-test');
      expect.fail('Should have rejected with ApiError');
    } catch (err) {
      expect(err.message).toBe('Validation failed');
      expect(err.status).toBe(400);
      expect(err.validationErrors).toEqual([{ field: 'email', message: 'invalid email' }]);
    }
  });

  it('REFRESH MUTEX CONCURRENCY: fires 2 simultaneous 401s -> triggers exactly ONE /auth/refresh call and retries both requests', async () => {
    setRefreshToken('valid-refresh-token');
    let refreshCallCount = 0;

    server.use(
      http.post('*/api/v1/auth/refresh', () => {
        refreshCallCount++;
        return HttpResponse.json({
          success: true,
          data: { accessToken: 'new-token-999', refreshToken: 'new-refresh-999' },
        });
      }),
      http.get('*/api/v1/concurrent-req-1', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth !== 'Bearer new-token-999') {
          return HttpResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({ success: true, data: 'result 1' });
      }),
      http.get('*/api/v1/concurrent-req-2', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth !== 'Bearer new-token-999') {
          return HttpResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({ success: true, data: 'result 2' });
      })
    );

    // Fire two simultaneous requests that 401
    const [res1, res2] = await Promise.all([
      axiosInstance.get('/api/v1/concurrent-req-1'),
      axiosInstance.get('/api/v1/concurrent-req-2'),
    ]);

    expect(refreshCallCount).toBe(1); // EXACTLY ONE refresh call fired
    expect(res1.data).toBe('result 1');
    expect(res2.data).toBe('result 2');
  });

  it('NO RETRY ON AUTH ENDPOINTS: 401 on /auth/login propagates directly without trigger refresh', async () => {
    let refreshFired = false;
    server.use(
      http.post('*/api/v1/auth/refresh', () => {
        refreshFired = true;
        return HttpResponse.json({ success: true, data: {} });
      }),
      http.post('*/api/v1/auth/login', () => {
        return HttpResponse.json({ success: false, message: 'Bad credentials' }, { status: 401 });
      })
    );

    try {
      await axiosInstance.post('/api/v1/auth/login', { email: 'bad@claimit.com', password: 'wrong' });
    } catch (err) {
      expect(err.message).toBe('Bad credentials');
    }
    expect(refreshFired).toBe(false);
  });

  it('ON 403 FORBIDDEN: propagates error cleanly without session clear redirect', async () => {
    server.use(
      http.get('*/api/v1/forbidden-resource', () => {
        return HttpResponse.json({ success: false, message: 'Access Denied' }, { status: 403 });
      })
    );

    try {
      await axiosInstance.get('/api/v1/forbidden-resource');
    } catch (err) {
      expect(err.status).toBe(403);
      expect(err.message).toBe('Access Denied');
    }
  });
});
