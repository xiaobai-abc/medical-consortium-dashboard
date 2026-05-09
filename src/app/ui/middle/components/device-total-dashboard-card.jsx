"use client";

import { useDeviceMonitorDialog } from "@/app/ui/components/device-monitor-dialog/context";

import DashboardCardIcon from "./dashboard-card-icon";

/**
 * 设备总数卡片通过全局 Provider 暴露的上下文方法打开弹窗。
 */
function DeviceTotalDashboardCard({ value, meta, loading, error }) {
  const { openDeviceMonitorDialog } = useDeviceMonitorDialog();

  function handleCardClick() {
    openDeviceMonitorDialog("total");
  }

  return (
    <div
      className="flex-1 bd1 rounded-xl px-3 py-3.5 flex flex-col text-left cursor-pointer transition-colors hover:bg-[rgba(17,31,61,0.92)]"
      style={{
        background:
          "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}
      onClick={handleCardClick}>
      <div className="flex items-center mb-2">
        <DashboardCardIcon>⚙</DashboardCardIcon>
        <span className="text-sm text-[#9FB5DA]/90">设备总数</span>
      </div>
        <div className="flex items-end justify-between">
          <span className="text-[#00E7FF] text-3xl leading-[24px] font-bold">
            {loading ? "..." : error ? "-" : value}
          </span>

          <div className="flex items-center leading-none">
            <span className="text-[#9FB5DA]/85 text-xs">
              {meta?.label || "较昨日"}
            </span>
            <span
              className="text-xs"
              style={{
                color:
                  meta?.tone === "down"
                    ? "#FF4D4F"
                    : meta?.tone === "up"
                      ? "#28E38A"
                      : "#E8F0FF",
              }}>
              {loading ? "加载中" : error ? "加载失败" : meta?.value || "-"}
            </span>
          </div>
        </div>
      </div>
  );
}

export default DeviceTotalDashboardCard;
