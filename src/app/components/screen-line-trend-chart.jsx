"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

/**
 * 生成折线趋势图配置，统一紫色渐变和大屏坐标样式。
 */
function createTrendChartOption(dates, values) {
  return {
    animationDuration: 900,
    animationEasing: "cubicOut",
    grid: {
      top: 26,
      right: 10,
      bottom: 28,
      left: 10,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10, 19, 38, 0.92)",
      borderColor: "rgba(127, 105, 215, 0.4)",
      textStyle: {
        color: "#E8F0FF",
      },
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "rgba(127, 105, 215, 0.5)",
        },
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: "rgba(92, 116, 180, 0.24)",
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#7F93BE",
        fontSize: 11,
        margin: 12,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      splitNumber: 4,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#7F93BE",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(92, 116, 180, 0.18)",
        },
      },
    },
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        // symbol: "circle",
        // symbolSize: 8,
        // showSymbol: true,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: "#B77DFF" },
            { offset: 0.5, color: "#8C73F0" },
            { offset: 1, color: "#6D8BFF" },
          ]),
        },
        // itemStyle: {
        //   color: "#D1BCFF",
        //   borderColor: "#7F69D7",
        //   borderWidth: 2,
        // },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(157, 101, 234, 0.45)" },
            { offset: 1, color: "rgba(109, 139, 255, 0.02)" },
          ]),
        },
        label: {
          show: true,
          position: "top",
          color: "#B9C8E7",
          fontSize: 11,
          distance: 8,
        },
      },
    ],
  };
}

/**
 * ECharts 折线趋势图组件，负责渲染和尺寸自适应。
 */
function ScreenLineTrendChart({ dates, values, className }) {
  const chartRef = useRef(null);

  useEffect(function initializeTrendChart() {
    if (!chartRef.current) {
      return;
    }

    const chartInstance = echarts.init(chartRef.current);
    const chartOption = createTrendChartOption(dates, values);
    const resizeObserver = new ResizeObserver(function resizeChart() {
      chartInstance.resize();
    });

    chartInstance.setOption(chartOption);
    resizeObserver.observe(chartRef.current);

    return function cleanupTrendChart() {
      resizeObserver.disconnect();
      chartInstance.dispose();
    };
  }, [dates, values]);

  return <div ref={chartRef} className={className} />;
}

export default ScreenLineTrendChart;
