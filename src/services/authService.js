import axiosInstance from './axiosInstance';

/**
 * Log in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} The inner data object containing tokenType, tokens, etc.
 */
export async function loginRequest(email, password) {
  const { data } = await axiosInstance.post('/api/v1/auth/login', { email, password });
  return data; // returns envelope.data directly
}

/**
 * Sends a reset password request for first-login reset flow.
 * Passes the passwordResetToken in the Authorization header.
 * @param {string} passwordResetToken
 * @param {string} newPassword
 * @returns {Promise<object>} The new accessToken and refreshToken inside envelope.data.
 */
export async function resetPasswordRequest(passwordResetToken, newPassword) {
  const { data } = await axiosInstance.post(
    '/api/v1/auth/reset-password',
    { newPassword },
    { headers: { Authorization: `Bearer ${passwordResetToken}` } }
  );
  return data;
}

/**
 * Refresh the access token.
 * @param {string} refreshToken
 * @returns {Promise<object>} The new access and refresh tokens inside envelope.data.
 */
export async function refreshRequest(refreshToken) {
  const { data } = await axiosInstance.post('/api/v1/auth/refresh', { refreshToken });
  return data;
}

/**
 * Best-effort logout request.
 * @param {string} refreshToken
 */
export async function logoutRequest(refreshToken) {
  try {
    await axiosInstance.post('/api/v1/auth/logout', { refreshToken });
  } catch (error) {
    console.warn('Backend token revocation failed or endpoint not found:', error);
  }
}
