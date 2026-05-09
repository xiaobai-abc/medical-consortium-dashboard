"use client";

import { useEffect, useState } from "react";

import { getDashboardData } from "@/api";
import { buildHomeDashboardView } from "../modules/dashboard-view-model";
import SectionBody from "./section";

/**
 * 首页客户端数据入口。
 *
 * 当前结构规划是：
 * - page.js 仍保持简洁，只负责页面壳子
 * - HomeDashboardClient 负责首页唯一一次 dashboard 请求
 * - SectionBody 和各业务卡片只吃状态和数据 props，不再各自请求
 *
 * 这样后面继续扩展首页模块时，数据源仍然只有一处。
 */
function HomeDashboardClient() {
  const [dashboardState, setDashboardState] = useState({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(function requestDashboardOnMount() {
    let disposed = false;

    /**
     * 首页只在首次进入时请求一次聚合接口。
     * 后续如果要做轮询或手动刷新，也应该继续收敛在这个组件里，
     * 不要把请求重新分散回各个卡片组件。
     */
    setDashboardState({
      status: "loading",
      data: null,
      error: null,
    });

    getDashboardData()
      .then(function handleSuccess(dashboardData) {
        if (disposed) {
          return;
        }

        setDashboardState({
          status: "success",
          data: dashboardData,
          error: null,
        });
      })
      .catch(function handleError(error) {
        if (disposed) {
          return;
        }

        setDashboardState({
          status: "error",
          data: null,
          error,
        });
      });

    return function cleanupDashboardRequest() {
      disposed = true;
    };
  }, []);

  return (
    <SectionBody
      dashboardStatus={dashboardState.status}
      dashboardError={dashboardState.error}
      dashboardView={buildHomeDashboardView(dashboardState.data)}
    />
  );
}

export default HomeDashboardClient;
