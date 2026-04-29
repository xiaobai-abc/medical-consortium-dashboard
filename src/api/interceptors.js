import { getUseMockFlag, isSuccessCode } from "./config";
import { ApiRequestError, normalizeApiError } from "./errors";
import { getAccessToken } from "./token";

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function defaultRequestInterceptor(requestConfig) {
  const headers = new Headers(requestConfig.headers || {});
  const requestBody = requestConfig.body;

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (requestConfig.withAuth !== false) {
    const accessToken = getAccessToken();

    if (accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  if (getUseMockFlag() && !headers.has("X-Use-Mock")) {
    headers.set("X-Use-Mock", "1");
  }

  if (
    requestBody !== undefined &&
    requestBody !== null &&
    isPlainObject(requestBody) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return {
    ...requestConfig,
    headers,
    body:
      requestBody !== undefined &&
      requestBody !== null &&
      isPlainObject(requestBody)
        ? JSON.stringify(requestBody)
        : requestBody,
  };
}

function defaultResponseInterceptor(responsePayload, context) {
  const { requestConfig, response } = context;

  if (
    requestConfig.unwrapResponse === false ||
    responsePayload === null ||
    responsePayload === undefined
  ) {
    return responsePayload;
  }

  if (Array.isArray(responsePayload) || typeof responsePayload !== "object") {
    return responsePayload;
  }

  if (responsePayload.success === false) {
    throw new ApiRequestError(
      responsePayload.message || responsePayload.msg || "业务请求失败",
      {
        code: responsePayload.code || "BUSINESS_ERROR",
        status: response.status,
        url: requestConfig.finalUrl,
        method: requestConfig.method,
        details: responsePayload,
        response,
      }
    );
  }

  if ("code" in responsePayload && !isSuccessCode(responsePayload.code)) {
    throw new ApiRequestError(
      responsePayload.message || responsePayload.msg || "业务请求失败",
      {
        code: responsePayload.code,
        status: response.status,
        url: requestConfig.finalUrl,
        method: requestConfig.method,
        details: responsePayload,
        response,
      }
    );
  }

  if ("data" in responsePayload) {
    return responsePayload.data;
  }

  if ("result" in responsePayload) {
    return responsePayload.result;
  }

  return responsePayload;
}

function defaultErrorInterceptor(errorValue, context) {
  throw normalizeApiError(errorValue, context.requestConfig);
}

function createHandlerBucket(defaultHandler) {
  const handlers = [defaultHandler];

  return {
    handlers,
    use(handler) {
      handlers.push(handler);
      return handlers.length - 1;
    },
    eject(index) {
      handlers[index] = null;
    },
  };
}

export function createInterceptors() {
  return {
    request: createHandlerBucket(defaultRequestInterceptor),
    response: createHandlerBucket(defaultResponseInterceptor),
    error: createHandlerBucket(defaultErrorInterceptor),
  };
}
