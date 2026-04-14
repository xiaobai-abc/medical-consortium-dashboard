"use client";

import { create } from "zustand";

const initialRuntimeState = {
  title: "医共体慢病管理平台",
  weatherText: "晴",
  temperatureText: "24°C",
  systemStatus: "normal",
  refreshAt: "",
};

const initialLayoutState = {
  screenWidth: 1920,
  screenHeight: 1080,
  scale: 1,
};

/**
 * 创建大屏基础 store，后续模块状态统一从这里继续扩展。
 */
export const useDashboardStore = create(function createDashboardStore(set) {
  return {
    runtime: initialRuntimeState,
    layout: initialLayoutState,
    panels: {},
    setRuntime: function setRuntime(nextRuntime) {
      set(function updateRuntimeState(currentState) {
        return {
          runtime: {
            ...currentState.runtime,
            ...nextRuntime,
          },
        };
      });
    },
    setLayout: function setLayout(nextLayout) {
      set(function updateLayoutState(currentState) {
        return {
          layout: {
            ...currentState.layout,
            ...nextLayout,
          },
        };
      });
    },
    setPanelState: function setPanelState(panelKey, panelState) {
      set(function updatePanelState(currentState) {
        return {
          panels: {
            ...currentState.panels,
            [panelKey]: {
              ...(currentState.panels[panelKey] || {}),
              ...panelState,
            },
          },
        };
      });
    },
    resetDashboardStore: function resetDashboardStore() {
      set({
        runtime: initialRuntimeState,
        layout: initialLayoutState,
        panels: {},
      });
    },
  };
});
