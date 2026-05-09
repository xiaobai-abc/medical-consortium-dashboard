import { AUTH_TOKEN_STORAGE_KEY, getConfiguredAccessToken } from "./config";

export function getAccessToken() {
  if (typeof window === "undefined") {
    return getConfiguredAccessToken();
  }

  return (
    window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    getConfiguredAccessToken()
  );
}

export function setAccessToken(tokenValue) {
  if (typeof window === "undefined") {
    return;
  }

  if (!tokenValue) {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, tokenValue);
}

export function clearAccessToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
