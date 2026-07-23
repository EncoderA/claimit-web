import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, triggerSessionExpired } from '../utils/tokenStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

// Endpoints that should not trigger silent refresh on 401
const AUTH_ENDPOINTS_EXCLUDED_FROM_RETRY = [
  "/api/v1/auth/login",
  "/api/v1/auth/refresh",
  "/api/v1/auth/reset-password",
];

// Helper to build standardized API errors
function buildApiError(envelope, status) {
  const err = new Error(envelope?.message || "Something went wrong. Please try again.");
  err.status = status;
  err.validationErrors = envelope?.validationErrors || null;
  return err;
}

// Request Interceptor: Attach bearer token from tokenStore if present and not clobbering
axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token refresh on 401, keep session on 403, and unwrap envelopes
axiosInstance.interceptors.response.use(
  (response) => {
    const envelope = response.data;
    if (envelope?.success === false) {
      return Promise.reject(buildApiError(envelope, response.status));
    }
    // Centrally unwrap: return the inner data payload
    response.data = envelope?.data;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const envelope = error.response?.data;
    const apiError = buildApiError(envelope, status);

    const isExcluded = AUTH_ENDPOINTS_EXCLUDED_FROM_RETRY.some((path) =>
      originalRequest.url?.includes(path)
    );

    // Handle 401 Unauthorized: Attempt silent refresh (unless excluded or already retried)
    if (status === 401 && !originalRequest._retry && !isExcluded) {
      originalRequest._retry = true;

      const rToken = getRefreshToken();
      if (!rToken) {
        triggerSessionExpired();
        return Promise.reject(apiError);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              const res = await axios.post(`${baseURL}/api/v1/auth/refresh`, {
                refreshToken: rToken,
              });
              // Note: axios.post uses raw axios, so we must unwrap manually
              const refreshEnvelope = res.data;
              if (refreshEnvelope?.success === false) {
                throw buildApiError(refreshEnvelope, res.status);
              }
              const { accessToken, refreshToken } = refreshEnvelope.data;
              setAccessToken(accessToken);
              setRefreshToken(refreshToken);
              return accessToken;
            } catch (refreshErr) {
              triggerSessionExpired();
              throw refreshErr;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        const newAccessToken = await refreshPromise;
        // Update header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }

    // Handle 403 Forbidden or other failures: propagate the standardized apiError
    return Promise.reject(apiError);
  }
);

export default axiosInstance;
