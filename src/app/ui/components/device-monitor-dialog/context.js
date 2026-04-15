"use client";

import { createContext, useContext } from "react";

export const DeviceMonitorDialogContext = createContext(null);

/**
 * 统一读取设备弹窗上下文，确保所有入口都走同一个 Provider。
 */
export function useDeviceMonitorDialog() {
  const deviceMonitorDialogContext = useContext(DeviceMonitorDialogContext);

  if (!deviceMonitorDialogContext) {
    throw new Error(
      "useDeviceMonitorDialog must be used within DeviceMonitorDialogProvider"
    );
  }

  return deviceMonitorDialogContext;
}
