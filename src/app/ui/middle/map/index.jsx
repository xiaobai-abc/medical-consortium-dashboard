"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

const ThreeBlockMap = dynamic(
  function loadThreeBlockMap() {
    return import("@/app/test/three-block-map");
  },
  {
    ssr: false,
    loading: function renderLoading() {
      return (
        <div className="flex h-full items-center justify-center text-sm text-[#9FB5DA]">
          地图加载中...
        </div>
      );
    },
  }
);

/**
 * 首页地图恢复为 three 地图展示。
 *
 * 当前策略：
 * - 首页继续使用原来的地图卡片壳子
 * - 卡片内部直接复用 test 页已经验证过的 three 地图组件
 * - map_distribution 先保留控制台打印，不参与 three 点位渲染
 */
function MainMap({ mapDistribution }) {
  useEffect(
    function logMapDistribution() {
      if (!mapDistribution) {
        return;
      }

      /**
       * TODO:
       * 当前首页地图只恢复原来的 three 展示。
       * 等 map_distribution 的字段和坐标方案确认后，再接入真实点位数据。
       */
      console.info("[MapDistribution]", mapDistribution);
    },
    [mapDistribution]
  );

  return (
    <div
      className="w-full flex-1 h-0 mb-3 bd1 rounded-2xl px-3.5 py-4 flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}>
      <div className="w-full flex items-center mb-2">
        <div className="flex items-center">
          <h3 className="text-sm text-[#9FB5DA] mr-3">异常数据看板区域地图</h3>
        </div>
        <div
          className="h-px w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
          }}
        />
      </div>

      <div className="flex-1 h-0 overflow-hidden rounded-[20px] border border-[#1D3B7A]/55 bg-[#081225]">
        <ThreeBlockMap
          showTopOverlay={false}
          showInfoPanel={false}
          showViewDebugPanel={false}
          enableCameraDrag={false}
          logViewConfigToConsole={false}
        />
      </div>
    </div>
  );
}

export default MainMap;
