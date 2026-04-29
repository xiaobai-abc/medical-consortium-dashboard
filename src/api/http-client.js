import {
  DEFAULT_REQUEST_TIMEOUT,
  DEFAULT_ERROR_MESSAGE,
  getApiBaseUrl,
} from "./config";
import { ApiRequestError, normalizeApiError } from "./errors";
import { createInterceptors } from "./interceptors";

function toAbsoluteUrl(baseUrl, requestUrl) {
  if (/^https?:\/\//i.test(requestUrl)) {
    return requestUrl;
  }

  if (!baseUrl) {
    return requestUrl;
  }

  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const normalizedRequestUrl = requestUrl.startsWith("/")
    ? requestUrl
    : `/${requestUrl}`;

  return `${normalizedBaseUrl}${normalizedRequestUrl}`;
}

function appendSearchParams(requestUrl, params) {
  if (!params || typeof params !== "object") {
    return requestUrl;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(function appendEntry([paramKey, paramValue]) {
    if (paramValue === undefined || paramValue === null || paramValue === "") {
      return;
    }

    if (Array.isArray(paramValue)) {
      paramValue.forEach(function appendArrayValue(arrayValue) {
        searchParams.append(paramKey, String(arrayValue));
      });
      return;
    }

    searchParams.append(paramKey, String(paramValue));
  });

  const queryString = searchParams.toString();

  if (!queryString) {
    return requestUrl;
  }

  return requestUrl.includes("?")
    ? `${requestUrl}&${queryString}`
    : `${requestUrl}?${queryString}`;
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const responseContentType = response.headers.get("content-type") || "";

  if (
    responseContentType.includes("application/json") ||
    responseContentType.includes("+json")
  ) {
    return response.json();
  }

  return response.text();
}

async function applyRequestInterceptors(handlers, requestConfig) {
  let nextRequestConfig = requestConfig;

  for (const handler of handlers) {
    if (!handler) {
      continue;
    }

    nextRequestConfig = await handler(nextRequestConfig);
  }

  return nextRequestConfig;
}

async function applyResponseInterceptors(handlers, responsePayload, context) {
  let nextResponsePayload = responsePayload;

  for (const handler of handlers) {
    if (!handler) {
      continue;
    }

    nextResponsePayload = await handler(nextResponsePayload, context);
  }

  return nextResponsePayload;
}

async function applyErrorInterceptors(handlers, errorValue, context) {
  let currentError = errorValue;

  for (const handler of handlers) {
    if (!handler) {
      continue;
    }

    try {
      return await handler(currentError, context);
    } catch (nextError) {
      currentError = nextError;
    }
  }

  throw normalizeApiError(currentError, context.requestConfig);
}

export function createHttpClient(clientOptions = {}) {
  const interceptors = createInterceptors();

  async function request(requestUrl, requestOptions = {}) {
    const nextRequestConfig = await applyRequestInterceptors(
      interceptors.request.handlers,
      {
      baseUrl: clientOptions.baseUrl || getApiBaseUrl(),
      timeout: clientOptions.timeout || DEFAULT_REQUEST_TIMEOUT,
      method: "GET",
      withAuth: true,
      unwrapResponse: true,
      ...requestOptions,
      url: requestUrl,
      }
    );

    const finalUrl = appendSearchParams(
      toAbsoluteUrl(nextRequestConfig.baseUrl, nextRequestConfig.url),
      nextRequestConfig.params
    );
    const abortController = new AbortController();
    const timeoutId = setTimeout(function handleTimeout() {
      abortController.abort();
    }, nextRequestConfig.timeout);

    try {
      const response = await fetch(finalUrl, {
        ...nextRequestConfig.fetchOptions,
        method: nextRequestConfig.method,
        headers: nextRequestConfig.headers,
        body: nextRequestConfig.body,
        signal: abortController.signal,
      });
      const responsePayload = await parseResponseBody(response);

      if (!response.ok) {
        throw new ApiRequestError(
          responsePayload?.message ||
            responsePayload?.msg ||
            `HTTP ${response.status}` ||
            DEFAULT_ERROR_MESSAGE,
          {
            code: responsePayload?.code || response.status,
            status: response.status,
            url: finalUrl,
            method: nextRequestConfig.method,
            details: responsePayload,
            response,
          }
        );
      }

      return await applyResponseInterceptors(
        interceptors.response.handlers,
        responsePayload,
        {
          response,
          requestConfig: {
            ...nextRequestConfig,
            finalUrl,
          },
        }
      );
    } catch (requestError) {
      return applyErrorInterceptors(interceptors.error.handlers, requestError, {
        requestConfig: {
          ...nextRequestConfig,
          finalUrl,
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    request,
    get(requestUrl, requestOptions = {}) {
      return request(requestUrl, {
        ...requestOptions,
        method: "GET",
      });
    },
    post(requestUrl, requestBody, requestOptions = {}) {
      return request(requestUrl, {
        ...requestOptions,
        method: "POST",
        body: requestBody,
      });
    },
    put(requestUrl, requestBody, requestOptions = {}) {
      return request(requestUrl, {
        ...requestOptions,
        method: "PUT",
        body: requestBody,
      });
    },
    patch(requestUrl, requestBody, requestOptions = {}) {
      return request(requestUrl, {
        ...requestOptions,
        method: "PATCH",
        body: requestBody,
      });
    },
    delete(requestUrl, requestOptions = {}) {
      return request(requestUrl, {
        ...requestOptions,
        method: "DELETE",
      });
    },
    interceptors,
  };
}

export const httpClient = createHttpClient();
