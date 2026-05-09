"use client";

import { useEffect, useState } from "react";

import { getMeasurementPopup } from "@/api";
import ScreenProgress from "@/app/components/screen-progress";
import { normalizeMeasurementPopup } from "@/app/modules/popup-view-model";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

function LeftL1({ measurementStatistics, dashboardStatus, dashboardError }) {
  const [activeMeasurementItem, setActiveMeasurementItem] = useState(null);
  const measurementItems = measurementStatistics?.items || [];
  const isLoading = dashboardStatus === "loading";
  const isError = dashboardStatus === "error";

  return (
    <div
      className="w-full flex-1 h-0 mb-3 bd1 rounded-2xl py-4 px-3.5 flex flex-col"
      style={{
        background:
          "linear-gradient(rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}>
      <div className="w-full flex items-center mb-3">
        <h3 className="text-sm text-[#9FB5DA]">检测项目数据统计</h3>
        <div
          className="h-px w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
          }}></div>
      </div>
      <div className="flex-1 h-0 mb-4">
        <ScrollArea className={cn("h-full")}>
          {measurementItems.length > 0 ? (
            <div className="pr-2">
              {measurementItems.map(function renderMeasurementItem(item, index) {
                return (
                  <ProgressBlock
                    key={`${item.title}-${item.value}`}
                    title={item.title}
                    value={item.value}
                    progress={item.progress}
                    colors={item.colors}
                    className={index === 0 ? "" : "pt-4"}
                    onClick={function handleClick() {
                      setActiveMeasurementItem(item);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <StatusPlaceholder status={dashboardStatus} error={dashboardError} />
          )}
        </ScrollArea>
      </div>
      <div className="flex items-center">
        <div className=" rounded-[50px] bd1 border-[#00E7FF]/35 px-5 py-2 flex-1">
          <h5 className="text-[#9FB5DA] text-xs mb-1">总测量次数</h5>
          <span className="text-[22px] text-[#00E7FF] leading-none">
            {isLoading
              ? "..."
              : isError
                ? "-"
                : (measurementStatistics?.totalMeasurements || 0).toLocaleString("zh-CN")}
          </span>
        </div>
        <div className=" rounded-[50px] bd1 border-[#00E7FF]/35 flex-1 ml-4 px-5 py-2">
          <h5 className="text-[#9FB5DA] text-xs mb-1">异常数据占比</h5>
          <span className="text-[22px] text-[#986df7] leading-none">
            {isLoading ? "..." : isError ? "-" : measurementStatistics?.abnormalRatio || "-"}
          </span>
        </div>
      </div>
      <MeasurementDialog
        activeMeasurementItem={activeMeasurementItem}
        onOpenChange={function handleDialogOpenChange(nextOpen) {
          if (!nextOpen) {
            setActiveMeasurementItem(null);
          }
        }}
      />
    </div>
  );
}

/**
 * 进度块仅负责展示单项统计，并响应点击打开详情弹窗。
 */
function ProgressBlock({ title, value, progress, colors, className, onClick }) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-xl transition-colors hover:bg-white/[0.03]",
        className
      )}
      onClick={onClick}>
      <div className="flex items-center justify-between">
        <h5 className="text-[13px] text-[#E8F0FF] leading-none tracking-[0.04em]">
          {title}
        </h5>
        <span className="text-[12px] text-[#A9B8D8] leading-none tracking-[0.08em]">
          {value.toLocaleString("zh-CN")}
        </span>
      </div>
      <div className="pt-2">
        <ScreenProgress
          progress={progress}
          colors={colors}
          trackClassName="border border-[#1E4B87]/70 bg-transparent"
          barClassName="shadow-[0_0_14px_rgba(89,194,221,0.28)]"
        />
      </div>
    </div>
  );
}

/**
 * 详情弹窗使用右侧卡片同款壳子，内容区留空供后续补充。
 */
function MeasurementDialog({ activeMeasurementItem, onOpenChange }) {
  const [dialogState, setDialogState] = useState({
    status: "idle",
    data: {
      totalMeasurements: 0,
      abnormalCount: 0,
      normalRatio: 0,
      abnormalRatio: 0,
      normalCount: 0,
      comparisonItems: [],
    },
    error: null,
  });

  useEffect(
    function requestMeasurementPopup() {
      if (!activeMeasurementItem) {
        return;
      }

      let disposed = false;

      setDialogState(function setLoadingState(previousState) {
        return {
          ...previousState,
          status: "loading",
          error: null,
        };
      });

      getMeasurementPopup({
        metric: activeMeasurementItem.metricKey || activeMeasurementItem.title,
      })
        .then(function handleSuccess(responseData) {
          if (disposed) {
            return;
          }

          setDialogState({
            status: "success",
            data: normalizeMeasurementPopup(responseData),
            error: null,
          });
        })
        .catch(function handleError(error) {
          if (disposed) {
            return;
          }

          setDialogState(function setErrorState(previousState) {
            return {
              ...previousState,
              status: "error",
              error,
            };
          });
        });

      return function cleanupMeasurementPopupRequest() {
        disposed = true;
      };
    },
    [activeMeasurementItem]
  );

  const normalRatioPercent = `${Math.round((dialogState.data.normalRatio || 0) * 100)}%`;
  const abnormalRatioPercent = `${Math.round((dialogState.data.abnormalRatio || 0) * 100)}%`;

  return (
    <Dialog open={Boolean(activeMeasurementItem)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[760px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[760px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-base text-white font-bold">
              {activeMeasurementItem
                ? activeMeasurementItem.title + "数据统计"
                : ""}
            </h2>

            <div className="pl-3">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    size="xs"
                    className="bg-[#1D3B7A]/75 rounded-[10px] w-12 h-7 text-xs border-[#1D3B7A]/75 leading-none hover:bg-[#00E7FF]/20 text-[#E8F0FF] font-thin"
                  />
                }>
                关闭
              </DialogClose>
            </div>
          </div>
            <div className="flex gap-x-3">
              <div className="px-3 py-3.5 bg-[rgba(29,59,122,0.3)] flex-1">
                <h6 className="text-[#9fb5da] mb-2">总测量次数</h6>
                <span className="text-[rgba(232,240,255,0.95)] text-[20px] leading-none">
                  {dialogState.status === "loading"
                    ? "..."
                    : dialogState.status === "error"
                      ? "-"
                      : dialogState.data.totalMeasurements.toLocaleString("zh-CN")}
                </span>
              </div>
              <div className="px-3 py-3.5 bg-[rgba(29,59,122,0.3)] flex-1">
                <h6 className="text-[#9fb5da] mb-2">异常数据</h6>
                <span className="text-[rgba(255,77,79,0.95)] text-[20px] leading-none">
                  {dialogState.status === "loading"
                    ? "..."
                    : dialogState.status === "error"
                      ? "-"
                      : dialogState.data.abnormalCount.toLocaleString("zh-CN")}
                </span>
              </div>
            </div>
          <h2 className="text-base text-white font-bold my-3">
            测量值与异常值占比
          </h2>
            <div className="bg-[rgba(29,59,122,0.2)] p-3">
              <div className="flex items-center">
                <span className="w-20 ">正常值:</span>
                <div className="flex-1 h-6 rounded-[5px] relative overflow-hidden">
                  <div
                    className="bg-[rgba(0,231,255,0.6)] h-full"
                    style={{ width: normalRatioPercent }}></div>
                  <span className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#E8F0FF] leading-none">
                    {dialogState.status === "loading"
                      ? "..."
                      : dialogState.status === "error"
                        ? "-"
                        : normalRatioPercent}
                  </span>
                </div>
                <span className="text-ms text-[rgba(232,240,255,0.88)] leading-none ml-2">
                  {dialogState.status === "loading"
                    ? "..."
                    : dialogState.status === "error"
                      ? "-"
                      : `${dialogState.data.normalCount.toLocaleString("zh-CN")}次`}
                </span>
              </div>
              <div className="flex items-center mt-2">
                <span className="w-20 ">异常值:</span>
                <div className="flex-1 h-6 rounded-[5px] relative overflow-hidden">
                  <div
                    className="bg-[#ad4b52] h-full"
                    style={{ width: abnormalRatioPercent }}></div>
                  <span className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#E8F0FF] leading-none">
                    {dialogState.status === "loading"
                      ? "..."
                      : dialogState.status === "error"
                        ? "-"
                        : abnormalRatioPercent}
                  </span>
                </div>
                <span className="text-ms text-[rgba(232,240,255,0.88)] leading-none ml-2">
                  {dialogState.status === "loading"
                    ? "..."
                    : dialogState.status === "error"
                      ? "-"
                      : `${dialogState.data.abnormalCount.toLocaleString("zh-CN")}次`}
                </span>
              </div>
            </div>
          <h2 className="text-base text-white font-bold my-3">所有指标对比</h2>
          {/* <ScrollArea className={cn("h-[520px] ")}></ScrollArea> */}
          <div className=" space-y-2">
            {dialogState.data.comparisonItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 bg-[rgba(29,59,122,0.2)] hover:bg-[rgba(29,59,122,0.4)] transition-colors duration-300",
                    "rounded-[3px] flex items-center justify-between"
                  )}>
                  <span className=" leading-none text-sm text-[#e8f0ff] ">
                    {item.name}
                  </span>
                  <span className="leading-none text-sm text-[rgba(159,181,218,0.9)] ">
                    <span className="mr-1">
                      测量: {item.measurementCount.toLocaleString("zh-CN")}
                    </span>
                    异常: {item.abnormalCount.toLocaleString("zh-CN")}
                  </span>
                </div>
              );
            })}
          </div>
          <DialogStatus
            status={dialogState.status}
            error={dialogState.error}
            empty={!dialogState.data.comparisonItems.length}
            emptyText="暂无检测项目明细数据"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LeftL1;

function StatusPlaceholder({ status, error }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#1E4B87]/50 text-sm text-[#9FB5DA]/85">
      {status === "loading"
        ? "检测统计加载中..."
        : status === "error"
          ? error?.message || "检测统计加载失败"
          : "暂无检测统计数据"}
    </div>
  );
}

function DialogStatus({ status, error, empty, emptyText }) {
  if (status === "loading") {
    return <div className="py-8 text-center text-sm text-[#9FB5DA]">弹窗数据加载中...</div>;
  }

  if (status === "error") {
    return (
      <div className="py-8 text-center text-sm text-[#FF9CA2]">
        {error?.message || "弹窗数据加载失败"}
      </div>
    );
  }

  if (empty) {
    return <div className="py-8 text-center text-sm text-[#9FB5DA]">{emptyText}</div>;
  }

  return null;
}
