// Keep the current access token in memory for the app session.
let accessToken = null;
let sessionExpiredCallback = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

// Keep the refresh token in session storage so it clears with the tab.
export function getRefreshToken() {
  return sessionStorage.getItem('claimit_refresh_token');
}

export function setRefreshToken(token) {
  if (token) {
    sessionStorage.setItem('claimit_refresh_token', token);
  } else {
    sessionStorage.removeItem('claimit_refresh_token');
  }
}

export function removeRefreshToken() {
  sessionStorage.removeItem('claimit_refresh_token');
}

export function onSessionExpired(callback) {
  sessionExpiredCallback = callback;
}

export function triggerSessionExpired() {
  if (sessionExpiredCallback) {
    sessionExpiredCallback();
  }
}
