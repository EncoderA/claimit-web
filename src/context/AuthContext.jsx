/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { decodeJwt } from '../utils/jwt';
import { getRefreshToken, setAccessToken, setRefreshToken, onSessionExpired } from '../utils/tokenStore';
import { loginRequest, refreshRequest, logoutRequest } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const refreshTimeoutRef = useRef(null);

  const clearSilentRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const extractUserFromToken = (token) => {
    const decoded = decodeJwt(token);
    if (!decoded) return null;
    return {
      id: decoded.sub,
      name: decoded.fullName || decoded.name || (decoded.sub && decoded.sub.includes('@') ? decoded.sub.split('@')[0] : 'User'),
      email: decoded.email || (decoded.sub && decoded.sub.includes('@') ? decoded.sub : ''),
      role: decoded.role || decoded.roles?.[0] || 'EMPLOYEE',
    };
  };

  const scheduleSilentRefresh = (expiresInSeconds) => {
    clearSilentRefresh();
    const delayMs = Math.max((expiresInSeconds - 60) * 1000, 10000);

    refreshTimeoutRef.current = setTimeout(async () => {
      const rToken = getRefreshToken();
      if (!rToken) return;

      try {
        const data = await refreshRequest(rToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        const decodedUser = extractUserFromToken(data.accessToken);
        if (decodedUser) {
          setUser((prev) => ({
            ...decodedUser,
            name: prev?.name || decodedUser.name,
            email: prev?.email || decodedUser.email,
          }));
          scheduleSilentRefresh(data.expiresIn || 900);
        }
      } catch (err) {
        console.error('Proactive silent refresh failed:', err);
        logout();
      }
    }, delayMs);
  };

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    
    if (data.tokenType === 'PASSWORD_RESET_REQUIRED') {
      // Save passwordResetToken in sessionStorage
      sessionStorage.setItem('claimit_password_reset_token', data.passwordResetToken);
      setUser(null);
      return { passwordResetRequired: true };
    }

    // Full Session
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    
    const userPayload = extractUserFromToken(data.accessToken);
    if (userPayload) {
      setUser(userPayload);
      scheduleSilentRefresh(data.expiresIn || 900);
      return { passwordResetRequired: false, user: userPayload };
    }
    
    throw new Error('Authentication failed: Invalid token payload.');
  };

  const handlePasswordResetSuccess = (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    sessionStorage.removeItem('claimit_password_reset_token');

    const userPayload = extractUserFromToken(accessToken);
    if (userPayload) {
      setUser(userPayload);
      scheduleSilentRefresh(900);
      return userPayload;
    }
    throw new Error('Reset password successful but session establishment failed.');
  };

  const logout = async () => {
    const rToken = getRefreshToken();
    clearSilentRefresh();
    
    // Clear client-side state immediately
    setAccessToken(null);
    setRefreshToken(null);
    sessionStorage.removeItem('claimit_password_reset_token');
    setUser(null);

    if (rToken) {
      await logoutRequest(rToken);
    }
  };

  useEffect(() => {
    onSessionExpired(() => {
      logout();
    });

    const initAuth = async () => {
      const rToken = getRefreshToken();
      if (!rToken) {
        setUser(null);
        setIsInitializing(false);
        return;
      }

      try {
        const data = await refreshRequest(rToken);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        const decodedUser = extractUserFromToken(data.accessToken);
        if (decodedUser) {
          setUser(decodedUser);
          scheduleSilentRefresh(data.expiresIn || 900);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session initialization refresh failed:', err);
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();

    return () => {
      clearSilentRefresh();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, isInitializing, login, logout, handlePasswordResetSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
