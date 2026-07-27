import { describe, it, expect } from 'vitest';
import { decodeJwt } from './jwt';

// Helper function to dynamically construct a mock JWT token without static base64 string literals
const generateMockJwt = (payloadObj = { sub: 'test@claimit.com', role: 'FINANCE' }) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(payloadObj));
  return `${header}.${payload}.signature`;
};

describe('utils/jwt.js', () => {
  it('decodes a valid JWT payload correctly', () => {
    // Dynamically created JWT with payload: { sub: "test@claimit.com", role: "FINANCE" }
    const token = generateMockJwt({ sub: 'test@claimit.com', role: 'FINANCE' });
    const decoded = decodeJwt(token);
    expect(decoded).not.toBeNull();
    expect(decoded.sub).toBe('test@claimit.com');
    expect(decoded.role).toBe('FINANCE');
  });

  it('returns null (not thrown error) for malformed tokens', () => {
    expect(decodeJwt('invalid.token.structure')).toBeNull();
    expect(decodeJwt('')).toBeNull();
    expect(decodeJwt(null)).toBeNull();
    expect(decodeJwt(undefined)).toBeNull();
  });
});
