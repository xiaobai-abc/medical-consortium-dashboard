import { httpClient } from "./http-client";

/**
 * popup 相关接口统一放在这个文件。
 *
 * 目录职责约定：
 * - src/api/*: 只负责“请求哪个接口”，不负责页面字段转换
 * - src/app/modules/*: 负责把接口字段整理成页面更容易消费的形状
 * - src/app/ui/*: 负责视图渲染和交互状态
 *
 * 这样后面继续补弹窗接口时，不会把“请求逻辑 / 字段映射 / 组件视图”混写在一起。
 */
export function getServiceOverviewPopup(params = {}, requestOptions = {}) {
  return httpClient.get("/api/dashboard/popups/service-overview", {
    ...requestOptions,
    params,
  });
}

/**
 * 重点随访弹窗。
 * 支持服务中心、关键字、检测项目、随访状态筛选。
 */
export function getFollowUpPopup(params = {}, requestOptions = {}) {
  return httpClient.get("/api/dashboard/popups/follow-up", {
    ...requestOptions,
    params,
  });
}

/**
 * 检测项目统计弹窗。
 * metric 是关键入参，允许传英文 key 或中文指标名。
 */
export function getMeasurementPopup(params = {}, requestOptions = {}) {
  return httpClient.get("/api/dashboard/popups/measurements", {
    ...requestOptions,
    params,
  });
}

/**
 * 单条实时预警详情。
 */
export function getWarningDetailPopup(warningId, requestOptions = {}) {
  return httpClient.get(`/api/dashboard/popups/warnings/${warningId}`, requestOptions);
}

/**
 * 设备列表弹窗。
 * 会根据入口类型携带 dialog_type / device_status / hospital_name / device_type 等筛选条件。
 */
export function getDeviceListPopup(params = {}, requestOptions = {}) {
  return httpClient.get("/api/dashboard/popups/devices", {
    ...requestOptions,
    params,
  });
}

/**
 * 单台设备详情弹窗。
 */
export function getDeviceDetailPopup(deviceCode, requestOptions = {}) {
  return httpClient.get(`/api/dashboard/popups/devices/${deviceCode}`, requestOptions);
}
