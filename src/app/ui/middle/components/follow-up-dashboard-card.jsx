"use client";

import { useState } from "react";

import DashboardCardIcon from "./dashboard-card-icon";
import FollowUpDialog from "./follow-up-dialog";

/**
 * 重点随访卡片负责管理弹窗开关，保持顶部面板入口文件轻量。
 */
function FollowUpDashboardCard({ value, valueSuffix, meta, loading, error }) {
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
          <DashboardCardIcon>📋</DashboardCardIcon>
          <span className="text-sm text-[#9FB5DA]/90">重点随访</span>
        </div>
        <div className="flex items-end justify-between">
          <h6 className="text-[#00E7FF] text-3xl leading-[24px] font-bold flex items-end">
            <span>{loading ? "..." : error ? "-" : value}</span>
            <span className="text-xs text-[#9FB5DA]/90 leading-[16px] ml-1">
              {valueSuffix || "人"}
            </span>
          </h6>

          <div className="flex items-center leading-none">
            <span className="text-[#9FB5DA]/85 text-xs mr-2">
              {meta?.label || "完成率"}
            </span>
            <span className="text-white text-xs flex items-center justify-center rounded-[10px] px-2 py-0.5 border border-[#1D3B7A]/60">
              {loading ? "加载中" : error ? "加载失败" : meta?.value || "-"}
            </span>
          </div>
        </div>
      </div>
      <FollowUpDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
      />
    </>
  );
}

export default FollowUpDashboardCard;
