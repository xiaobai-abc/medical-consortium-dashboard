"use client";

import { renderToStaticMarkup } from "react-dom/server";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export const BAR_DANGER_THRESHOLD = 1000;
export const BAR_WARNING_THRESHOLD = 800;

export const BAR_NORMAL_STYLE = {
  barColor: "#68F2FF",
  glowColor: "rgba(104, 242, 255, 0.32)",
  valueTextColor: "#A8F6FF",
  valueBorderColor: "rgba(93, 233, 255, 0.86)",
  valueBackground: "rgba(11, 43, 82, 0.94)",
  nameTextColor: "#A8F6FF",
  nameBorderColor: "rgba(93, 233, 255, 0.82)",
  nameBackground: "rgba(8, 49, 86, 0.74)"
};

export const BAR_WARNING_STYLE = {
  barColor: "#FFD34D",
  glowColor: "rgba(255, 211, 77, 0.3)",
  valueTextColor: "#FFE680",
  valueBorderColor: "rgba(255, 211, 77, 0.86)",
  valueBackground: "rgba(73, 56, 9, 0.94)",
  nameTextColor: "#FFE680",
  nameBorderColor: "rgba(255, 211, 77, 0.82)",
  nameBackground: "rgba(88, 65, 8, 0.74)"
};

export const BAR_DANGER_STYLE = {
  barColor: "#FF4E58",
  glowColor: "rgba(255, 78, 88, 0.34)",
  valueTextColor: "#FF9CA2",
  valueBorderColor: "rgba(255, 78, 88, 0.88)",
  valueBackground: "rgba(72, 9, 17, 0.94)",
  nameTextColor: "#FF6670",
  nameBorderColor: "rgba(255, 78, 88, 0.84)",
  nameBackground: "rgba(88, 8, 19, 0.74)"
};

export function getBarVisualStyle(metricValue) {
  if (metricValue >= BAR_DANGER_THRESHOLD) {
    return BAR_DANGER_STYLE;
  }

  if (metricValue >= BAR_WARNING_THRESHOLD) {
    return BAR_WARNING_STYLE;
  }

  return BAR_NORMAL_STYLE;
}

export function getBarHeight(metricValue, maxMetricValue, minHeight, maxHeight) {
  const safeMetricValue = Math.max(metricValue, 0);
  const safeMaxMetricValue = Math.max(maxMetricValue, 1);
  const normalizedMetricValue = safeMetricValue / safeMaxMetricValue;

  return minHeight + (maxHeight - minHeight) * normalizedMetricValue;
}

function ReactBarMarker({
  name = "测试标记",
  value = "1280",
  style = BAR_NORMAL_STYLE
}) {
  return (
    <div
      style={{
        transform: "translate(-50%, 0%)",
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px"
      }}>
      <div className="h-fit flex flex-col items-center">
        <div
          className="w-2 h-10"
          style={{
            background: `linear-gradient(180deg, ${style.valueTextColor} 0%, ${style.barColor} 100%)`,
            boxShadow: `0 0 18px ${style.glowColor}`,
            transition: "all 160ms ease"
          }}></div>
        <div
          className="rounded-full w-3 h-3 -mt-1"
          style={{
            background: style.barColor,
            boxShadow: `0 0 16px ${style.glowColor}`,
            transition: "all 160ms ease"
          }}></div>
      </div>
      <div
        style={{
          minWidth: "48px",
          padding: "3px 10px",
          borderRadius: "6px",
          border: `1px solid ${style.valueBorderColor}`,
          background: style.valueBackground,
          boxShadow: `0 0 18px ${style.glowColor}`,
          color: style.valueTextColor,
          fontSize: "12px",
          fontWeight: "700",
          lineHeight: "1",
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          transition: "all 160ms ease"
        }}>
        {value}
      </div>
      <div
        style={{
          padding: "4px 14px",
          borderRadius: "999px",
          border: `1px solid ${style.nameBorderColor}`,
          background: style.nameBackground,
          boxShadow: `0 0 18px ${style.glowColor}`,
          color: style.nameTextColor,
          fontSize: "11px",
          fontWeight: "500",
          lineHeight: "1",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          transition: "all 160ms ease"
        }}>
        {name}
      </div>
    </div>
  );
}

export function createReactBarMarkerObject({
  x = 0,
  y = 0,
  z = 0,
  name = "测试标记",
  value = "1280",
  metricValue
}) {
  const markerElement = document.createElement("div");
  const resolvedMetricValue =
    typeof metricValue === "number" ? metricValue : Number(value) || 0;
  const barStyle = getBarVisualStyle(resolvedMetricValue);

  markerElement.innerHTML = renderToStaticMarkup(
    <ReactBarMarker name={name} value={value} style={barStyle} />
  );

  const markerObject = new CSS2DObject(markerElement);
  markerObject.position.set(x, y, z);

  return {
    markerObject,
    markerElement,
    style: barStyle,
    metricValue: resolvedMetricValue
  };
}

export function MapDetailTooltipCard({
  containerRef,
  className = "",
  name = "区块名称",
  value = "-",
  metricColor = BAR_NORMAL_STYLE.valueTextColor
}) {
  return (
    <div
      ref={containerRef}
      className={`min-w-[180px] rounded-sm border border-cyan-300/35 bg-[#061629]/92 px-4 py-3 text-white shadow-[0_0_28px_rgba(96,166,246,0.2)] backdrop-blur ${className}`}>
      <p className="mt-1 text-sm font-semibold text-white">{name}</p>
      <div
        className="mt-2 flex items-center gap-1 text-sm"
        style={{ color: metricColor }}>
        <span>异常数据数量:</span>
        <span className="text-right">{value}</span>
        <span>条</span>
      </div>
    </div>
  );
}
