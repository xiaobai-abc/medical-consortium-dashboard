"use client";

import { useEffect, useRef, useState } from "react";

import { getDashboardData } from "@/api";
import ScreenHeader from "../components/screen-header";
import { buildHomeDashboardView } from "../modules/dashboard-view-model";
import SectionBody from "./section";

const DASHBOARD_REFRESH_INTERVAL = 60 * 1000 * 3;

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
function HomeDashboardClient({ headerData }) {
  const [dashboardState, setDashboardState] = useState({
    status: "loading",
    data: null,
    error: null,
    isRefreshing: false,
  });
  const dashboardStateRef = useRef(dashboardState);
  const requestSequenceRef = useRef(0);
  const isRequestInFlightRef = useRef(false);
  const isDisposedRef = useRef(false);

  function updateDashboardState(nextDashboardState) {
    setDashboardState(function resolveDashboardState(previousDashboardState) {
      const resolvedDashboardState =
        typeof nextDashboardState === "function"
          ? nextDashboardState(previousDashboardState)
          : nextDashboardState;

      dashboardStateRef.current = resolvedDashboardState;
      return resolvedDashboardState;
    });
  }

  function requestDashboardData({ preserveData = false } = {}) {
    /**
     * 首页数据请求、手动刷新、定时轮询都统一走这里。
     * 这样可以把副作用控制在一处：
     * - 首次进入显示 loading
     * - 后续轮询/手动刷新保留旧数据，避免整屏闪烁
     * - 组件卸载或热更新后，旧请求结果不会再回写状态
     */
    if (isRequestInFlightRef.current) {
      return Promise.resolve();
    }

    const hasCurrentData = Boolean(dashboardStateRef.current.data);
    const shouldPreserveData = preserveData && hasCurrentData;
    const requestSequence = requestSequenceRef.current + 1;

    requestSequenceRef.current = requestSequence;
    isRequestInFlightRef.current = true;

    if (shouldPreserveData) {
      updateDashboardState(function markRefreshing(previousDashboardState) {
        return {
          ...previousDashboardState,
          error: null,
          isRefreshing: true,
        };
      });
    } else {
      updateDashboardState({
        status: "loading",
        data: null,
        error: null,
        isRefreshing: true,
      });
    }

    return getDashboardData()
      .then(function handleSuccess(dashboardData) {
        if (
          isDisposedRef.current ||
          requestSequence !== requestSequenceRef.current
        ) {
          return;
        }

        updateDashboardState({
          status: "success",
          data: dashboardData,
          error: null,
          isRefreshing: false,
        });
      })
      .catch(function handleError(error) {
        if (
          isDisposedRef.current ||
          requestSequence !== requestSequenceRef.current
        ) {
          return;
        }

        if (shouldPreserveData) {
          updateDashboardState(function clearRefreshing(previousDashboardState) {
            return {
              ...previousDashboardState,
              isRefreshing: false,
            };
          });
          return;
        }

        updateDashboardState({
          status: "error",
          data: null,
          error,
          isRefreshing: false,
        });
      })
      .finally(function handleFinally() {
        if (requestSequence === requestSequenceRef.current) {
          isRequestInFlightRef.current = false;
        }
      });
  }

  useEffect(function requestDashboardOnMount() {
    isDisposedRef.current = false;
    requestDashboardData();

    const refreshIntervalId = window.setInterval(function refreshDashboardData() {
      requestDashboardData({
        preserveData: true,
      });
    }, DASHBOARD_REFRESH_INTERVAL);

    return function cleanupDashboardRefreshEffect() {
      isDisposedRef.current = true;
      requestSequenceRef.current += 1;
      isRequestInFlightRef.current = false;
      window.clearInterval(refreshIntervalId);
    };
  }, []);

  return (
    <>
      <ScreenHeader
        title={headerData.title}
        statusText={headerData.statusText}
        onRefresh={function handleRefresh() {
          requestDashboardData({
            preserveData: true,
          });
        }}
        refreshing={dashboardState.isRefreshing}
      />
      <SectionBody
        dashboardStatus={dashboardState.status}
        dashboardError={dashboardState.error}
        dashboardView={buildHomeDashboardView(dashboardState.data)}
      />
    </>
  );
}

export default HomeDashboardClient;
