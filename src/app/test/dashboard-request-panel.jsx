"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getApiAuthHeaderName,
  getApiAuthScheme,
  getApiBaseUrl,
  getDashboardApiPath,
  getDashboardData,
} from "@/api";

function getResponseKeys(responseData) {
  if (!responseData || typeof responseData !== "object") {
    return [];
  }

  return Object.keys(responseData);
}

function getResponsePreview(responseData) {
  if (responseData === null || responseData === undefined) {
    return "null";
  }

  try {
    return JSON.stringify(responseData, null, 2);
  } catch {
    return String(responseData);
  }
}

export default function DashboardRequestPanel() {
  const [requestState, setRequestState] = useState({
    status: "idle",
    data: null,
    error: "",
    requestedAt: "",
  });

  const requestUrl = useMemo(function buildRequestUrl() {
    return `${getApiBaseUrl()}${getDashboardApiPath()}`;
  }, []);

  function requestDashboardData() {
    setRequestState(function setLoadingState(previousState) {
      return {
        ...previousState,
        status: "loading",
        error: "",
      };
    });

    getDashboardData()
      .then(function handleSuccess(responseData) {
        setRequestState({
          status: "success",
          data: responseData,
          error: "",
          requestedAt: new Date().toLocaleString("zh-CN"),
        });
      })
      .catch(function handleError(error) {
        setRequestState({
          status: "error",
          data: null,
          error: error?.message || "请求失败",
          requestedAt: new Date().toLocaleString("zh-CN"),
        });
      });
  }

  useEffect(function requestDashboardDataOnMount() {
    requestDashboardData();
  }, []);

  const responseKeys = getResponseKeys(requestState.data);
  const responsePreview = getResponsePreview(requestState.data);

  return (
    <aside className="absolute left-4 top-4 z-30 w-[420px] rounded-3xl border border-cyan-400/20 bg-slate-950/75 p-4 text-white shadow-[0_0_30px_rgba(0,180,255,0.12)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-cyan-300/72">API TEST</p>
          <h2 className="mt-1 text-base font-semibold">dashboard 接口联调</h2>
        </div>
        <button
          type="button"
          onClick={requestDashboardData}
          className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-400/10">
          重新请求
        </button>
      </div>

      <div className="mt-4 space-y-2 text-xs text-cyan-50/86">
        <p>
          <span className="text-cyan-200/60">状态</span>
          {" : "}
          <span>
            {requestState.status === "loading"
              ? "请求中"
              : requestState.status === "success"
                ? "成功"
                : requestState.status === "error"
                  ? "失败"
                  : "未开始"}
          </span>
        </p>
        <p className="break-all">
          <span className="text-cyan-200/60">地址</span>
          {" : "}
          <span>{requestUrl}</span>
        </p>
        <p>
          <span className="text-cyan-200/60">认证头</span>
          {" : "}
          <span>
            {getApiAuthHeaderName()}
            {getApiAuthScheme() ? ` (${getApiAuthScheme()})` : ""}
          </span>
        </p>
        <p>
          <span className="text-cyan-200/60">时间</span>
          {" : "}
          <span>{requestState.requestedAt || "-"}</span>
        </p>
        <p>
          <span className="text-cyan-200/60">接口字段</span>
          {" : "}
          <span>{responseKeys.length ? responseKeys.join(", ") : "-"}</span>
        </p>
      </div>

      {requestState.error ? (
        <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-3 py-3 text-xs text-red-100">
          {requestState.error}
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-cyan-400/16 bg-[#071322] p-3">
        <p className="text-[11px] tracking-[0.22em] text-cyan-300/68">
          RESPONSE PREVIEW
        </p>
        <pre className="mt-2 max-h-[280px] overflow-auto whitespace-pre-wrap break-all text-xs leading-5 text-cyan-50/90">
          {requestState.status === "success"
            ? responsePreview
            : requestState.status === "loading"
              ? "loading..."
              : "暂无返回数据"}
        </pre>
      </div>
    </aside>
  );
}
