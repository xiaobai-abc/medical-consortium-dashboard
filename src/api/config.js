export const DEFAULT_REQUEST_TIMEOUT = 15000;
export const DEFAULT_ERROR_MESSAGE = "请求失败，请稍后重试";
export const AUTH_TOKEN_STORAGE_KEY = "medical-consortium-access-token";
export const API_SUCCESS_CODES = ["0", "200"];

export function isServerSide() {
  return typeof window === "undefined";
}

export function getApiBaseUrl() {
  const clientBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const serverBaseUrl = process.env.SERVER_API_BASE_URL || clientBaseUrl;

  return isServerSide() ? serverBaseUrl : clientBaseUrl || serverBaseUrl;
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
