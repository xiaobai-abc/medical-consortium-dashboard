"use client";

import dynamic from "next/dynamic";

const ThreeBlockMap = dynamic(
  function loadThreeBlockMap() {
    return import("./components/home-three-block-map");
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

function MainMap({ mapDistribution }) {
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
        {/* 首页地图只开放平移，不开放旋转，这样用户拖动时不会把当前固定视角打乱。 */}
        <ThreeBlockMap
          mapDistribution={mapDistribution}
          showTopOverlay={false}
          showInfoPanel={false}
          showViewDebugPanel={false}
          enableCameraRotate={false}
          enableCameraPan
          logViewConfigToConsole={false}
        />
      </div>
    </div>
  );
}

export default MainMap;
