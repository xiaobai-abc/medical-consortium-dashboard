"use client";

import dynamic from "next/dynamic";
import DashboardRequestPanel from "./dashboard-request-panel";

const ThreeBlockMap = dynamic(() => import("./three-block-map"), {
  ssr: false,
});

/**
 * 测试页同时承载 three 地图和真实接口联调面板。
 * 这里优先展示接口字段，方便后面按接口结构往首页回填。
 */
export default function TestPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#031525]">
      <DashboardRequestPanel />
      <ThreeBlockMap />
    </main>
  );
}
