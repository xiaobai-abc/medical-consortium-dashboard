import { getHomeHeaderData } from "./modules/home-header";
import DashboardShell from "./ui/dashboard-shell";

/**
 * 首页输出极简大屏壳，标题栏展示运行状态与日期信息。
 */
export default function HomePage() {
  const headerData = getHomeHeaderData();

  return (
    <DashboardShell
      title={headerData.title}
      statusText={headerData.statusText}
    />
  );
}
