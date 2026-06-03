import { methodNotAllowed, proxyJsonGet } from "../../../../_lib/proxy";

const ALLOWED_METHODS = ["GET"];

export async function onRequestGet(context) {
  const deviceCode = encodeURIComponent(String(context.params?.deviceCode || ""));
  return proxyJsonGet(context, `/api/dashboard/popups/devices/${deviceCode}`);
}

export async function onRequest() {
  return methodNotAllowed(ALLOWED_METHODS);
}
