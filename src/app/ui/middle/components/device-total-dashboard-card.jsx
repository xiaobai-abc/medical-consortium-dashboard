"use client";

import { cn } from "@/lib/utils";
import { useDeviceMonitorDialog } from "@/app/ui/components/device-monitor-dialog/context";

/**
 * 设备总数卡片通过全局 Provider 暴露的上下文方法打开弹窗。
 */
function DeviceTotalDashboardCard() {
  const { openDeviceMonitorDialog } = useDeviceMonitorDialog();

  return (
    <div
      className="flex-1 bd1 rounded-xl px-3 py-3.5 flex flex-col text-left cursor-pointer transition-colors hover:bg-[rgba(17,31,61,0.92)]"
      style={{
        background:
          "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}
      onClick={function handleClick() {
        openDeviceMonitorDialog("total");
      }}>
      <div className="flex items-center mb-2">
        <DeviceTotalPop>⚙</DeviceTotalPop>
        <span className="text-sm text-[#9FB5DA]/90">设备总数</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-[#00E7FF] text-3xl leading-[24px] font-bold">
          9678
        </span>

        <div className="flex items-center leading-none">
          <span className="text-[#9FB5DA]/85 text-xs">较昨日</span>
          <span className="text-[#28E38A]/95 text-xs">↑ 2.0%</span>
        </div>
      </div>
    </div>
  );
}

function DeviceTotalPop({ children }) {
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full border mr-3",
        "border-[#00E7FF]/50 flex items-center justify-center text-xs"
      )}
      style={{
        background:
          "radial-gradient(circle at left 40% top 40%, rgb(0 231 255 / 70%) 0%, transparent 55%)"
      }}>
      {children}
    </div>
  );
}

export default DeviceTotalDashboardCard;
