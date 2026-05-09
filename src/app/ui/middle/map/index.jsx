"use client";

import { useEffect } from "react";

/**
 * 首页地图数据先不接入渲染。
 *
 * 目录和职责规划：
 * - 当前组件只负责“首页地图卡片壳子”和地图数据占位提示
 * - 如果接口返回了 map_distribution，先输出到控制台确认真实字段结构
 * - 后续真正接地图时，再单独新增 map view-model 或 map adapter
 * - 不要把 map_distribution 的字段猜测、坐标映射、three 渲染逻辑直接堆回这个文件
 *
 * 这样可以保证地图接入分两步推进：
 * 1. 先验证接口数据到底长什么样
 * 2. 再决定 three 柱子、标签、坐标映射应该放在哪一层
 */
function MainMap({ dashboardStatus, dashboardError, mapDistribution }) {
  useEffect(
    function logMapDistribution() {
      if (!mapDistribution) {
        return;
      }

      /**
       * 这里刻意只打印，不做渲染绑定。
       * 原因是 map_distribution 当前还没有被验证成可直接驱动 three 地图的点位结构。
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

      <div className="flex-1 h-0 rounded-[20px] overflow-hidden border border-[#1D3B7A]/55 bg-[#081225]">
        <div className="flex h-full items-center justify-center px-8 text-center">
          <div>
            <p className="text-lg text-white">地图数据待接入</p>
            <p className="mt-2 text-sm text-[#9FB5DA]">
              {dashboardStatus === "loading"
                ? "正在加载地图分布数据..."
                : dashboardStatus === "error"
                  ? dashboardError?.message || "地图数据加载失败"
                  : mapDistribution
                    ? "已收到 map_distribution，当前已输出到控制台"
                    : "当前接口未返回可用地图分布数据"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainMap;
