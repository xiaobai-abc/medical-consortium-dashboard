"use client";

import dynamic from "next/dynamic";
const ThreeBlockMap = dynamic(() => import("./three-block-map"), {
  ssr: false
});

/**
 * 测试页只承载独立地图文件，方便直接调试地图逻辑。
 */
export default function TestPage() {
  return (
    <main className="bg-[#031525] h-screen w-screen overflow-hidden">
      <ThreeBlockMap />
    </main>
  );
}
