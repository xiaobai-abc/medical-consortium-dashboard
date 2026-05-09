import { getHomeHeaderData } from "./modules/home-header";
import ScreenHeader from "./components/screen-header";
import HomeDashboardClient from "./ui/home-dashboard-client";

/**
 * 首页输出极简大屏壳，标题栏展示运行状态与日期信息。
 */
export default function HomePage() {
  const headerData = getHomeHeaderData();

  return (
    <main className="screen-grid-bg h-screen w-screen overflow-hidden text-white">
      <div className="mx-auto h-screen w-screen py-3.5 px-4.5 grid grid-rows-[auto_1fr] ">
        <ScreenHeader
          title={headerData.title}
          statusText={headerData.statusText}
        />
        <HomeDashboardClient />
      </div>
    </main>
  );
}
