import { DEFAULT_ERROR_MESSAGE } from "./config";

export class ApiRequestError extends Error {
  constructor(message, options = {}) {
    super(message || DEFAULT_ERROR_MESSAGE);
    this.name = "ApiRequestError";
    this.code = options.code;
    this.status = options.status;
    this.url = options.url;
    this.method = options.method;
    this.details = options.details;
    this.isAbort = Boolean(options.isAbort);
    this.isNetworkError = Boolean(options.isNetworkError);
    this.response = options.response;
  }
}

export function normalizeApiError(error, requestConfig = {}) {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (error?.name === "AbortError") {
    return new ApiRequestError("请求超时，请稍后重试", {
      code: "REQUEST_TIMEOUT",
      url: requestConfig.finalUrl || requestConfig.url,
      method: requestConfig.method,
      isAbort: true,
      details: error,
    });
  }

  return new ApiRequestError(error?.message || DEFAULT_ERROR_MESSAGE, {
    code: error?.code || "REQUEST_ERROR",
    status: error?.status,
    url: requestConfig.finalUrl || requestConfig.url,
    method: requestConfig.method,
    response: error?.response,
    details: error,
    isNetworkError: true,
  });
}
