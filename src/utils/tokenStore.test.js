import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken } from './tokenStore';

describe('utils/tokenStore.js', () => {
  beforeEach(() => {
    setAccessToken(null);
    sessionStorage.clear();
    localStorage.clear();
  });

  it('setAccessToken and getAccessToken round-trip correctly in memory', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('my-secret-access-token');
    expect(getAccessToken()).toBe('my-secret-access-token');
  });

  it('INVARIANT: access token never touches localStorage or sessionStorage', () => {
    const localSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    setAccessToken('in-memory-only-token');
    
    // Assert setAccessToken did not write to localStorage or sessionStorage
    expect(localSpy).not.toHaveBeenCalledWith(expect.anything(), 'in-memory-only-token');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('accessToken')).toBeNull();

    localSpy.mockRestore();
  });

  it('setRefreshToken saves to sessionStorage correctly', () => {
    setRefreshToken('refresh-token-123');
    expect(getRefreshToken()).toBe('refresh-token-123');
    expect(sessionStorage.getItem('claimit_refresh_token')).toBe('refresh-token-123');
  });
});
