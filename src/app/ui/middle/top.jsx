import { cn } from "../../../lib/utils";
import FollowUpDashboardCard from "./components/follow-up-dashboard-card";

// 顶部的 dashboard
function TopDashboard() {
  return (
    <div className="mb-3 flex gap-x-3">
      <div
        className="flex-1 bd1 rounded-xl px-3 py-3.5 flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
        }}>
        <div className="flex items-center mb-2">
          <POP>👤</POP>
          <span className="text-sm text-[#9FB5DA]/90">今日总服务人次</span>
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
      {/* --- */}
      <div
        className="flex-1 bd1 rounded-xl px-3 py-3.5 flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
        }}>
        <div className="flex items-center mb-2">
          <POP index={1}>🔔</POP>
          <span className="text-sm text-[#9FB5DA]/90">实时预警</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-[#00E7FF] text-3xl leading-[24px] font-bold">
            43
          </span>

          <div className="flex items-center leading-none">
            <span className="text-[#9FB5DA]/85 text-xs">较昨日</span>
            <span className="text-[#FF4D4F]/95 text-xs">↓ 2.0%</span>
          </div>
        </div>
      </div>
      {/* --- */}
      <FollowUpDashboardCard />
      {/* --- */}
      <div
        className="flex-1 bd1 rounded-xl px-3 py-3.5 flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
        }}>
        <div className="flex items-center mb-2">
          <POP>⚙</POP>
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
    </div>
  );
}

export default TopDashboard;

function POP({ index, children }) {
  const i = index ?? 0;

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full border mr-3",
        i == 0 ? "border-[#00E7FF]/50" : "border-[#A06BFF]/30",
        "flex items-center justify-center text-xs"
      )}
      style={{
        background: `radial-gradient(circle at left 40% top 40%, ${i == 0 ? "rgb(0 231 255 / 70%)" : "rgb(160 107 255 / 70%)"} 0%, transparent 55%)`
      }}>
      {children}
    </div>
  );
}
