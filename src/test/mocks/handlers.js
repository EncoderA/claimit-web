import { http, HttpResponse } from 'msw';

// Helper function to dynamically construct a mock JWT token without static base64 string literals
const generateMockJwt = (payloadObj = { sub: 'test@claimit.com', role: 'FINANCE' }) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(payloadObj));
  return `${header}.${payload}.signature`;
};

const MOCK_JWT = generateMockJwt();

export const handlers = [
  // Auth endpoints
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'invalid@claimit.com') {
      return HttpResponse.json(
        { success: false, message: 'Invalid credentials', validationErrors: null },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: {
        tokenType: 'FULL_SESSION',
        accessToken: MOCK_JWT,
        refreshToken: 'mock-refresh-token-jwt',
        passwordResetToken: null,
      },
    });
  }),

  http.post('*/api/v1/auth/refresh', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: {
        accessToken: MOCK_JWT,
        refreshToken: 'new-mock-refresh-token',
      },
    });
  }),

  http.post('*/api/v1/auth/logout', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Success',
      data: null,
    });
  }),

  // Finance endpoints
  http.get('*/api/v1/finance/reports/review-queue', async () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'EXP-1182',
          reportTitle: 'Team offsite supplies',
          dept: 'Engineering',
          amount: 3200,
          riskScore: 12,
          approvedBy: 'Sunita Kapoor',
          approvedDate: 'Jul 20, 2026',
        },
        {
          id: 'EXP-1175',
          reportTitle: 'Airport cab - quarterly review',
          dept: 'Sales',
          amount: 850,
          riskScore: 6,
          approvedBy: 'Anil Bhatia',
          approvedDate: 'Jul 19, 2026',
        },
      ],
    });
  }),

  http.get('*/api/v1/finance/payout-batches', async () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          batchId: 'PB-0044',
          reportsCount: 7,
          totalAmount: 184200,
          createdDate: 'Jul 20',
          status: 'PAID',
        },
      ],
    });
  }),
];
