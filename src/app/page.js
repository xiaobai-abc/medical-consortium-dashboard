import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

import DashboardShell from "./ui/dashboard-shell";

/**
 * 首页输出极简大屏壳，标题栏展示运行状态与日期信息。
 */
export default function HomePage() {
  dayjs.locale("zh-cn");

  const currentDateLabel = dayjs().format("YYYY年M月D日 dddd");
  const weatherText = process.env.NEXT_PUBLIC_WEATHER_TEXT || "晴";
  const temperatureText = process.env.NEXT_PUBLIC_WEATHER_TEMPERATURE || "24°C";
  const statusText = `系统运行正常 ${currentDateLabel} ${weatherText} ${temperatureText}`;

  return (
    <DashboardShell
      title="医共体慢病管理平台"
      statusText={statusText}
    />
  );
}
