"use client";

import { useState } from "react";

import { DeviceMonitorDialogContext } from "./context";
import DeviceMonitorDialogRoot from "./index";

const initialDialogState = {
  isOpen: false,
  dialogType: "all",
  dialogPayload: null
};

/**
 * 设备弹窗 Provider 在页面中只挂载一次，负责统一托管弹窗状态。
 */
function DeviceMonitorDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState(initialDialogState);

  function openDeviceMonitorDialog(dialogType, dialogPayload) {
    setDialogState({
      isOpen: true,
      dialogType: dialogType || "all",
      dialogPayload: dialogPayload || null
    });
  }

  function closeDeviceMonitorDialog() {
    setDialogState(function createNextDialogState(currentDialogState) {
      return {
        ...currentDialogState,
        isOpen: false,
        dialogPayload: null
      };
    });
  }

  return (
    <DeviceMonitorDialogContext.Provider
      value={{
        ...dialogState,
        openDeviceMonitorDialog,
        closeDeviceMonitorDialog
      }}>
      {children}
      <DeviceMonitorDialogRoot />
    </DeviceMonitorDialogContext.Provider>
  );
}

export default DeviceMonitorDialogProvider;
