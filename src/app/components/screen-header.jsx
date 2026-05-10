"use client";

import { RotateCwIcon } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * 大屏顶部标题栏组件，负责展示标题和系统状态信息。
 */
export default function ScreenHeader({
  title,
  statusText,
  onRefresh,
  refreshing = false
}) {
  return (
    <header
      className={cn(
        "screen-panel-glow relative rounded-[20px] border border-cyan-400/16 bg-slate-950/72 h-[82px] mb-3",
        "relative"
      )}
      style={{
        background: `radial-gradient(
    circle,
    rgba(0, 231, 255, 0.18) 0%,
    rgba(0, 231, 255, 0) 70%
  ),
  linear-gradient(
    90deg,
    rgba(11, 21, 48, 0.82) 0%,
    rgba(11, 21, 48, 0.42) 100%
  );`
      }}>
      <div className="h-full flex flex-col justify-center">
        <h1 className="text-center text-[26px] text-[#E8F0FF] font-bold">
          {title}
        </h1>
        <div className="flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" />
          <p className="pl-3 text-center text-base text-cyan-50/88">
            {statusText}
          </p>
        </div>
      </div>
      <div className="absolute right-4 top-0 bottom-0 flex items-center">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex justify-center items-center  h-10 px-5  rounded-[10px] border border-cyan-400/28 bg-[rgba(9,23,45,0.9)] text-cyan-50 transition hover:bg-[rgba(18,42,78,0.96)] disabled:cursor-not-allowed disabled:opacity-70">
          {/* <RotateCwIcon
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
          /> */}
          <span>{refreshing ? "刷新中" : "刷新数据"}</span>
        </button>
      </div>
    </header>
  );
}
