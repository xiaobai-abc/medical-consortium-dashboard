"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import FollowUpDialog from "./follow-up-dialog";

/**
 * 重点随访卡片负责管理弹窗开关，保持顶部面板入口文件轻量。
 */
function FollowUpDashboardCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div
        className="flex-1 bd1 rounded-xl px-3 py-3.5 flex flex-col text-left cursor-pointer transition-colors hover:bg-[rgba(17,31,61,0.92)]"
        style={{
          background:
            "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
        }}
        onClick={() => {
          setIsDialogOpen(true);
        }}>
        <div className="flex items-center mb-2">
          <FollowUpPop>📋</FollowUpPop>
          <span className="text-sm text-[#9FB5DA]/90">重点随访</span>
        </div>
        <div className="flex items-end justify-between">
          <h6 className="text-[#00E7FF] text-3xl leading-[24px] font-bold flex items-end">
            <span>28</span>
            <span className="text-xs text-[#9FB5DA]/90 leading-[16px] ml-1">
              人
            </span>
          </h6>

          <div className="flex items-center leading-none">
            <span className="text-[#9FB5DA]/85 text-xs mr-2">完成率</span>
            <span className="text-white text-xs flex items-center justify-center rounded-[10px] px-2 py-0.5 border border-[#1D3B7A]/60">
              77%
            </span>
          </div>
        </div>
      </div>
      <FollowUpDialog
        open={isDialogOpen}
        onOpenChange={function handleOpenChange(nextOpen) {
          setIsDialogOpen(nextOpen);
        }}
      />
    </>
  );
}

function FollowUpPop({ children }) {
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

export default FollowUpDashboardCard;
