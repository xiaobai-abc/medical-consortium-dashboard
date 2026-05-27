"use client";

import { useEffect, useRef } from "react";

import { echarts } from "./register-line";

/**
 * 统一处理 ECharts 实例创建、尺寸监听和销毁，业务组件只负责提供配置。
 */
export function useECharts(createOption, deps) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(function initializeChartInstance() {
    const chartElement = chartRef.current;

    if (!chartElement) {
      return;
    }

    const chartInstance =
      echarts.getInstanceByDom(chartElement) || echarts.init(chartElement);
    const resizeObserver = new ResizeObserver(function resizeChart() {
      chartInstance.resize();
    });

    chartInstanceRef.current = chartInstance;
    resizeObserver.observe(chartElement);

    return function cleanupChart() {
      resizeObserver.disconnect();
      chartInstanceRef.current = null;
      chartInstance.dispose();
    };
  }, []);

  useEffect(
    function syncChartOption() {
      if (!chartInstanceRef.current) {
        return;
      }

      chartInstanceRef.current.setOption(createOption());
    },
    deps
  );

  return chartRef;
}
