"use client";

import { cn } from "@/lib/utils";

/**
 * 顶部统计卡片统一使用这一层图标光晕壳子。
 * 这里只承载纯视觉样式，不包含任何业务文案、数值或点击逻辑，
 * 这样各个卡片仍然可以各自独立演进。
 */
function DashboardCardIcon({ tone = "cyan", children }) {
  const isPurpleTone = tone === "purple";

  return (
    <div
      className={cn(
        "mr-3 flex h-8 w-8 items-center justify-center rounded-full border text-xs",
        isPurpleTone ? "border-[#A06BFF]/30" : "border-[#00E7FF]/50"
      )}
      style={{
        background: `radial-gradient(circle at left 40% top 40%, ${
          isPurpleTone ? "rgb(160 107 255 / 70%)" : "rgb(0 231 255 / 70%)"
        } 0%, transparent 55%)`
      }}>
      {children}
    </div>
  );
}

export default DashboardCardIcon;
