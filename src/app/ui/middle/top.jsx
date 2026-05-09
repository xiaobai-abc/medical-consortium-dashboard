import DeviceTotalDashboardCard from "./components/device-total-dashboard-card";
import DashboardCardIcon from "./components/dashboard-card-icon";
import FollowUpDashboardCard from "./components/follow-up-dashboard-card";
import TodayServiceDashboardCard from "./components/today-service-dashboard-card";

function formatDashboardValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString("zh-CN");
  }

  return value ?? "-";
}

// 顶部的 dashboard
function TopDashboard({ overviewCards, dashboardStatus, dashboardError }) {
  const isLoading = dashboardStatus === "loading";
  const isError = dashboardStatus === "error";
  const realtimeWarningsCard = overviewCards?.realtimeWarnings || {};

  return (
    <div className="mb-3 flex gap-x-3">
      <TodayServiceDashboardCard
        value={formatDashboardValue(overviewCards?.todayService?.value)}
        meta={overviewCards?.todayService?.meta}
        loading={isLoading}
        error={isError}
      />
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
            {isLoading
              ? "..."
              : isError
                ? "-"
                : formatDashboardValue(realtimeWarningsCard.value)}
          </span>

          <div className="flex items-center leading-none">
            <span className="text-[#9FB5DA]/85 text-xs">
              {realtimeWarningsCard.meta?.label || "较昨日"}
            </span>
            <span
              className="text-xs"
              style={{
                color:
                  realtimeWarningsCard.meta?.tone === "down"
                    ? "#FF4D4F"
                    : realtimeWarningsCard.meta?.tone === "up"
                      ? "#28E38A"
                      : "#E8F0FF",
              }}>
              {isLoading
                ? "加载中"
                : isError
                  ? "加载失败"
                  : realtimeWarningsCard.meta?.value || "-"}
            </span>
          </div>
        </div>
      </div>
      {/* --- */}
      <FollowUpDashboardCard
        value={formatDashboardValue(overviewCards?.followUp?.value)}
        valueSuffix={overviewCards?.followUp?.valueSuffix}
        meta={overviewCards?.followUp?.meta}
        loading={isLoading}
        error={isError}
      />
      {/* --- */}
      <DeviceTotalDashboardCard
        value={formatDashboardValue(overviewCards?.deviceTotal?.value)}
        meta={overviewCards?.deviceTotal?.meta}
        loading={isLoading}
        error={isError}
      />
    </div>
  );
}

export default TopDashboard;
