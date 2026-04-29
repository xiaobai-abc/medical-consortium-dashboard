import DeviceTotalDashboardCard from "./components/device-total-dashboard-card";
import DashboardCardIcon from "./components/dashboard-card-icon";
import FollowUpDashboardCard from "./components/follow-up-dashboard-card";
import TodayServiceDashboardCard from "./components/today-service-dashboard-card";

// 顶部的 dashboard
function TopDashboard() {
  return (
    <div className="mb-3 flex gap-x-3">
      <TodayServiceDashboardCard />
      {/* --- */}
      <div
        className="flex-1 bd1 rounded-xl px-3 py-3.5 flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
        }}>
        <div className="flex items-center mb-2">
          <DashboardCardIcon tone="purple">🔔</DashboardCardIcon>
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
      <DeviceTotalDashboardCard />
    </div>
  );
}

export default TopDashboard;
