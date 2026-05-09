"use client";

import { useState } from "react";

import DashboardCardIcon from "./dashboard-card-icon";
import TodayServiceDialog from "./today-service-dialog";

/**
 * “今日总服务人次”只负责入口展示和弹窗开关。
 * 具体筛选与表格逻辑全部留在弹窗内部，避免卡片和详情内容相互耦合。
 */
function TodayServiceDashboardCard({ value, meta, loading, error }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleCardClick() {
    setIsDialogOpen(true);
  }

  function handleDialogOpenChange(nextOpen) {
    setIsDialogOpen(nextOpen);
  }

  return (
    <>
      <div
        className="flex-1 bd1 rounded-xl px-3 py-3.5 flex flex-col text-left cursor-pointer transition-colors hover:bg-[rgba(17,31,61,0.92)]"
        style={{
          background:
            "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
        }}
        onClick={handleCardClick}>
        <div className="flex items-center mb-2">
          <DashboardCardIcon>👤</DashboardCardIcon>
          <span className="text-sm text-[#9FB5DA]/90">今日总服务人次</span>
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
      <TodayServiceDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </>
  );
}

export default TodayServiceDashboardCard;
