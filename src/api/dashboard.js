import { getDashboardApiPath } from "./config";
import { httpClient } from "./http-client";

/**
 * 首页大屏聚合接口。
 * 这里直接返回接口字段，不提前做页面字段映射。
 */
export function getDashboardData(requestOptions = {}) {
  return httpClient.get(getDashboardApiPath(), requestOptions);
}
