import DashboardShell from "./ui/dashboard-shell";
import {
  DASHBOARD_BOOTSTRAP_STEPS,
  DASHBOARD_METRICS,
  DASHBOARD_SECTIONS,
} from "./modules/dashboard-content";

/**
 * 首页输出大屏项目初始化骨架，后续继续承接真实模块。
 */
export default function HomePage() {
  const runtimeConfig = {
    appName: process.env.NEXT_PUBLIC_APP_NAME || "医共体管理平台",
    appShortName:
      process.env.NEXT_PUBLIC_APP_SHORT_NAME || "医共体运行大屏",
    appEnv:
      process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV || "development",
    apiBaseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080",
    amapKey: process.env.NEXT_PUBLIC_AMAP_KEY || "",
    screenBaseWidth: Number(process.env.NEXT_PUBLIC_SCREEN_BASE_WIDTH || 1920),
    screenBaseHeight: Number(process.env.NEXT_PUBLIC_SCREEN_BASE_HEIGHT || 1080),
    useMock: process.env.NEXT_PUBLIC_USE_MOCK === "1",
  };

  return (
    <DashboardShell
      runtimeConfig={runtimeConfig}
      metrics={DASHBOARD_METRICS}
      sections={DASHBOARD_SECTIONS}
      bootstrapSteps={DASHBOARD_BOOTSTRAP_STEPS}
    />
  );
}
