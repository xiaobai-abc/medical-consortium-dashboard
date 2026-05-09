"use client";

import { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import { useDeviceMonitorDialog } from "@/app/ui/components/device-monitor-dialog/context";
import { cn } from "../../../lib/utils";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import RightAlertDetailDialog from "./components/alert-detail-dialog";

/**
 * 右侧设备监控卡片，统一承接设备监控与异常预警交互。
 */
function RightR1({
  realtimeWarnings,
  deviceMonitoring,
  dashboardStatus,
  dashboardError,
}) {
  const { openDeviceMonitorDialog } = useDeviceMonitorDialog();
  const [activeAlert, setActiveAlert] = useState(null);
  const [isAlertDetailOpen, setIsAlertDetailOpen] = useState(false);
  const alertList = realtimeWarnings?.items || [];
  const isLoading = dashboardStatus === "loading";
  const isError = dashboardStatus === "error";

  /**
   * 打开异常预警详情弹窗，并记录当前点击项。
   */
  function handleAlertItemClick(alertItem) {
    setActiveAlert(alertItem);
    setIsAlertDetailOpen(true);
  }

  /**
   * 关闭异常预警详情弹窗时，顺带清理当前项。
   */
  function handleAlertDetailOpenChange(nextOpen) {
    setIsAlertDetailOpen(nextOpen);
    if (!nextOpen) {
      setActiveAlert(null);
    }
  }

  return (
    <>
      <div
        className="w-full flex-1 h-0 mb-3 bd1 rounded-2xl px-3.5 py-4 flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
        }}>
        <div className="w-full flex items-center mb-2">
          <div className="flex items-center">
            <h3 className="text-sm text-[#9FB5DA] mr-3">物联网设备监控</h3>
            <ViewAllButton
              onClick={function handleViewAllClick() {
                openDeviceMonitorDialog("all");
              }}>
              查看全部
            </ViewAllButton>
          </div>
          <div
            className="h-px w-full flex-1 ml-3"
            style={{
              background:
                "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
            }}
          />
        </div>
        <div className="flex justify-between gap-x-3 mb-3">
          <BlockTT
            id={1}
            title="在线设备"
            value={
              isLoading
                ? "..."
                : isError
                  ? "-"
                  : deviceMonitoring?.onlineCount?.toLocaleString("zh-CN") || "0"
            }
            onClick={function handleOnlineClick() {
              openDeviceMonitorDialog("online", {
                deviceStatus: "online"
              });
            }}
          />
          <BlockTT
            id={2}
            title="离线设备"
            value={
              isLoading
                ? "..."
                : isError
                  ? "-"
                  : deviceMonitoring?.offlineCount?.toLocaleString("zh-CN") || "0"
            }
            onClick={function handleOfflineClick() {
              openDeviceMonitorDialog("offline", {
                deviceStatus: "offline"
              });
            }}
          />
        </div>
        <h3 className="text-sm text-[#9FB5DA] mb-2">异常数据实时预警</h3>
        <ScrollArea className="flex-1 h-0 -mr-1">
          {alertList.length > 0 ? (
            <div className="space-y-2.5 pr-1">
              {alertList.map(function renderAlertItem(alertItem) {
                return (
                  <Item
                    key={alertItem.id}
                    alertItem={alertItem}
                    onClick={function handleClick() {
                      handleAlertItemClick(alertItem);
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
      <RightAlertDetailDialog
        open={isAlertDetailOpen}
        onOpenChange={handleAlertDetailOpenChange}
        alertDetail={activeAlert}
      />
    </>
  );
}
export default RightR1;

function StatusPlaceholder({ status, error }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#1E4B87]/50 text-sm text-[#9FB5DA]/85">
      {status === "loading"
        ? "预警数据加载中..."
        : status === "error"
          ? error?.message || "预警数据加载失败"
          : "暂无实时预警数据"}
    </div>
  );
}

/**
 * 异常预警行项，点击后打开预警详情弹窗。
 */
function Item({ alertItem, onClick }) {
  return (
    <button
      type="button"
      className="w-full text-left bd1 rounded-2xl py-3.5 px-2.5 flex items-center justify-between cursor-pointer transition-colors hover:bg-[rgba(17,31,61,0.72)]"
      onClick={onClick}>
      <i className="w-2.5 h-2.5 bg-[#FF4D4F]/90 rounded-full"></i>
      <div className="ml-4.5">
        <h6 className="text-xs text-[#E8F0FF]/90">
          {alertItem.metricName}: {alertItem.metricValue}
        </h6>
        <span className="text-[#9FB5DA] text-xs">
          {alertItem.hospitalName}
        </span>
      </div>
      <span className="ml-auto mr-0 text-xs text-[#9FB5DA]/90">
        {alertItem.warningTime}
      </span>
    </button>
  );
}

function ViewAllButton({ children, onClick }) {
  return (
    <Button
      className={cn(
        "bg-[#00E7FF]/13 rounded-3xl px-2 py-0.5 text-xs border-[#00E7FF]/65 leading-none h-fit hover:bg-[#00E7FF]/20 ",
        "text-xs text-[#E8F0FF] font-thin"
      )}
      variant="outline"
      size="xs"
      onClick={onClick}>
      {children}
    </Button>
  );
}

function BlockTT({ id, title, value, onClick }) {
  return (
    <div
      className="bd1 rounded-2xl px-3.5 py-3 flex items-center flex-1 bg-[#0B1530]/35 cursor-pointer transition-colors hover:bg-[rgba(17,31,61,0.72)]"
      onClick={onClick}>
      <div
        className={cn(
          "w-8 h-8 rounded-full border mr-3",
          id == 1 ? "border-[#00E7FF]/30" : "border-[#A06BFF]/30"
        )}
        style={{
          background: `radial-gradient(circle at left 40% top 40%, ${id == 1 ? "rgb(0 231 255 / 35%)" : "rgb(160 107 255 / 35%)"} 0%, transparent 55%)`
        }}></div>
      <div className="">
        <h6 className="text-xs text-[#9FB5DA]/90">{title}</h6>
        <span className="text-white text-[18px]">{value}</span>
      </div>
    </div>
  );
}
