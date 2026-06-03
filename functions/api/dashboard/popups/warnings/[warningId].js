import { methodNotAllowed, proxyJsonGet } from "../../../../_lib/proxy";

const ALLOWED_METHODS = ["GET"];

export async function onRequestGet(context) {
  const warningId = encodeURIComponent(String(context.params?.warningId || ""));
  return proxyJsonGet(context, `/api/dashboard/popups/warnings/${warningId}`);
}

export async function onRequest() {
  return methodNotAllowed(ALLOWED_METHODS);
}
