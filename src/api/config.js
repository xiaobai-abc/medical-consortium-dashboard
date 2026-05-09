export const DEFAULT_REQUEST_TIMEOUT = 15000;
export const DEFAULT_ERROR_MESSAGE = "请求失败，请稍后重试";
export const AUTH_TOKEN_STORAGE_KEY = "medical-consortium-access-token";
export const API_SUCCESS_CODES = ["0", "200"];
export const DEFAULT_API_AUTH_HEADER_NAME = "Authorization";
export const DEFAULT_API_AUTH_SCHEME = "Bearer";
export const DEFAULT_DASHBOARD_API_PATH = "/api/dashboard";

export function isServerSide() {
  return typeof window === "undefined";
}

export function getApiBaseUrl() {
  const clientBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const serverBaseUrl = process.env.SERVER_API_BASE_URL || clientBaseUrl;

  return isServerSide() ? serverBaseUrl : clientBaseUrl || serverBaseUrl;
}

export function getApiAuthHeaderName() {
  return (
    process.env.NEXT_PUBLIC_API_AUTH_HEADER_NAME ||
    DEFAULT_API_AUTH_HEADER_NAME
  );
}

export function getApiAuthScheme() {
  return process.env.NEXT_PUBLIC_API_AUTH_SCHEME ?? DEFAULT_API_AUTH_SCHEME;
}

export function getDashboardApiPath() {
  return (
    process.env.NEXT_PUBLIC_DASHBOARD_API_PATH || DEFAULT_DASHBOARD_API_PATH
  );
}

export function getConfiguredAccessToken() {
  const clientToken = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN || "";
  const serverToken = process.env.SERVER_API_ACCESS_TOKEN || clientToken;

  return isServerSide() ? serverToken : clientToken;
}

export function getUseMockFlag() {
  return process.env.NEXT_PUBLIC_USE_MOCK === "1";
}

export function isSuccessCode(code) {
  if (code === null || code === undefined || code === "") {
    return true;
  }

  return API_SUCCESS_CODES.includes(String(code));
}
