"use client";

import { useECharts } from "@/lib/echarts/use-echarts";

/**
 * 历史测量数据折线图使用直线和蓝色主视觉，便于和设备详情场景保持统一。
 */
function createHistoryLineChartOption(dates, values) {
  return {
    animationDuration: 800,
    animationEasing: "cubicOut",
    grid: {
      top: 18,
      right: 12,
      bottom: 24,
      left: 8,
      containLabel: true
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10, 19, 38, 0.94)",
      borderColor: "rgba(36, 82, 164, 0.55)",
      textStyle: {
        color: "#E8F0FF"
      },
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "rgba(54, 124, 255, 0.5)"
        }
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: "rgba(75, 105, 170, 0.38)"
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: "#7F93BE",
        fontSize: 11,
        margin: 10
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: "value",
      splitNumber: 4,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: "#7F93BE",
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: "rgba(75, 105, 170, 0.2)"
        }
      }
    },
    series: [
      {
        type: "line",
        data: values,
        smooth: false,
        symbol: "circle",
        symbolSize: 7,
        showSymbol: true,
        lineStyle: {
          width: 3,
          color: "#3D8BFF"
        },
        itemStyle: {
          color: "#74B6FF",
          borderColor: "#D5EAFF",
          borderWidth: 1.5
        },
        areaStyle: {
          color: "rgba(61, 139, 255, 0.10)"
        }
      }
    ]
  };
}

/**
 * 历史测量折线图只负责渲染设备详情里的 7 日趋势。
 */
function DeviceMonitorHistoryLineChart({ dates, values, className }) {
  const chartRef = useECharts(function createOption() {
    return createHistoryLineChartOption(dates, values);
  }, [dates, values]);

  return <div ref={chartRef} className={className} />;
}

export default DeviceMonitorHistoryLineChart;
