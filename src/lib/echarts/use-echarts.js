"use client";

import { useEffect, useRef } from "react";

import { echarts } from "./register-line";

/**
 * 统一处理 ECharts 实例创建、尺寸监听和销毁，业务组件只负责提供配置。
 */
export function useECharts(createOption, deps) {
  const chartRef = useRef(null);

  useEffect(function initializeChart() {
    if (!chartRef.current) {
      return;
    }

    const chartInstance = echarts.init(chartRef.current);
    const resizeObserver = new ResizeObserver(function resizeChart() {
      chartInstance.resize();
    });

    chartInstance.setOption(createOption());
    resizeObserver.observe(chartRef.current);

    return function cleanupChart() {
      resizeObserver.disconnect();
      chartInstance.dispose();
    };
  }, deps);

  return chartRef;
}
