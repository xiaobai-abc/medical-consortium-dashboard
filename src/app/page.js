import DashboardShell from "./ui/dashboard-shell";
import {
  DASHBOARD_BOOTSTRAP_STEPS,
  DASHBOARD_METRICS,
  DASHBOARD_SECTIONS,
} from "./modules/dashboard-content";
import { getPublicRuntimeConfig } from "@/lib/env";

/**
 * 首页输出大屏项目初始化骨架，后续继续承接真实模块。
 */
export default function HomePage() {
  const runtimeConfig = getPublicRuntimeConfig();

  return (
    <DashboardShell
      runtimeConfig={runtimeConfig}
      metrics={DASHBOARD_METRICS}
      sections={DASHBOARD_SECTIONS}
      bootstrapSteps={DASHBOARD_BOOTSTRAP_STEPS}
    />
  );
}
