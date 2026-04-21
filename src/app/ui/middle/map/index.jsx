"use client";

import { useEffect, useState } from "react";
import HangzhouL7Map from "./components/hangzhou-l7-map";
import { createHangzhouMapData } from "./lib/create-map-data";
import { getHangzhouGeoJson } from "./lib/get-map-geojson";

/**
 * 中部地图卡片在客户端请求静态 GeoJSON，并引用独立地图组件。
 */
function MainMap() {
  const [mapData, setMapData] = useState(null);

  /**
   * 组件挂载后请求静态 GeoJSON，并整理成地图组件可消费的数据结构。
   */
  useEffect(function loadMapDataEffect() {
    let isDisposed = false;

    /**
     * 拉取静态 GeoJSON 后生成地图数据。
     */
    async function loadMapData() {
      const hangzhouGeoJson = await getHangzhouGeoJson();

      if (isDisposed) {
        return;
      }

      setMapData(createHangzhouMapData(hangzhouGeoJson));
    }

    loadMapData().catch(function handleMapDataError(error) {
      console.error("Load map geojson failed", error);
    });

    /**
     * 组件卸载后阻止过期请求继续写状态。
     */
    return function cleanupLoadMapDataEffect() {
      isDisposed = true;
    };
  }, []);

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

      {mapData ? (
        <HangzhouL7Map mapData={mapData} />
      ) : (
        <div className="flex-1 h-0 rounded-[20px] border border-[#1D3B7A]/55 bg-[#081225]" />
      )}
    </div>
  );
}

export default MainMap;
