import { methodNotAllowed, proxyJsonGet } from "../../../_lib/proxy";

const ALLOWED_METHODS = ["GET"];

export async function onRequestGet(context) {
  return proxyJsonGet(context, "/api/dashboard/popups/service-overview");
}

export async function onRequest() {
  return methodNotAllowed(ALLOWED_METHODS);
}
