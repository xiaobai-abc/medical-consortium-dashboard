import { httpClient } from "./http-client";

export function getServiceOverviewPopup(params = {}, requestOptions = {}) {
  return httpClient.get("/api/dashboard/popups/service-overview", {
    ...requestOptions,
    params,
  });
}

export function getFollowUpPopup(params = {}, requestOptions = {}) {
  return httpClient.get("/api/dashboard/popups/follow-up", {
    ...requestOptions,
    params,
  });
}

export function getMeasurementPopup(params = {}, requestOptions = {}) {
  return httpClient.get("/api/dashboard/popups/measurements", {
    ...requestOptions,
    params,
  });
}

export function getWarningDetailPopup(warningId, requestOptions = {}) {
  return httpClient.get(`/api/dashboard/popups/warnings/${warningId}`, requestOptions);
}

export function getDeviceListPopup(params = {}, requestOptions = {}) {
  return httpClient.get("/api/dashboard/popups/devices", {
    ...requestOptions,
    params,
  });
}

export function getDeviceDetailPopup(deviceCode, requestOptions = {}) {
  return httpClient.get(`/api/dashboard/popups/devices/${deviceCode}`, requestOptions);
}
