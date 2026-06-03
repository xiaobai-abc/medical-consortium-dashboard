const DEFAULT_UPSTREAM_ORIGIN = "http://121.40.242.155";
const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function getUpstreamOrigin(env) {
  return trimTrailingSlash(env?.SERVER_API_ORIGIN) || DEFAULT_UPSTREAM_ORIGIN;
}

function getProxyAuthHeaderConfig(env) {
  if (env?.SERVER_API_AUTH_HEADER_NAME) {
    return {
      headerName: env.SERVER_API_AUTH_HEADER_NAME,
      scheme: String(env?.SERVER_API_AUTH_SCHEME || "").trim()
    };
  }

  return {
    headerName: "Authorization",
    scheme: "Bearer"
  };
}

function applyProxyAuthHeader(headers, env) {
  const accessToken = String(env?.SERVER_API_ACCESS_TOKEN || "").trim();

  if (!accessToken) {
    return;
  }

  const { headerName, scheme } = getProxyAuthHeaderConfig(env);
  headers.set(
    headerName,
    scheme ? `${scheme} ${accessToken}` : accessToken
  );
}

function buildJsonErrorResponse(status, message, detail) {
  return new Response(
    JSON.stringify({
      message,
      ...(detail ? { detail } : {})
    }),
    {
      status,
      headers: {
        "content-type": JSON_CONTENT_TYPE,
        "cache-control": "no-store"
      }
    }
  );
}

export async function proxyJsonGet(context, upstreamPath) {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const targetUrl = `${getUpstreamOrigin(env)}${upstreamPath}${requestUrl.search}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");
  applyProxyAuthHeader(headers, env);

  const abortController = new AbortController();
  const timeoutId = setTimeout(function handleProxyTimeout() {
    abortController.abort();
  }, DEFAULT_REQUEST_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: "GET",
      headers,
      redirect: "manual",
      signal: abortController.signal
    });
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set("cache-control", "no-store");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    const isAbortError = error?.name === "AbortError";

    return buildJsonErrorResponse(
      isAbortError ? 504 : 502,
      isAbortError ? "Proxy request timeout" : "Proxy request failed",
      String(error?.message || error)
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export function methodNotAllowed(allowedMethods) {
  return buildJsonErrorResponse(
    405,
    `Method not allowed. Supported methods: ${allowedMethods.join(", ")}`
  );
}
