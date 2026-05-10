"use client";

import { useEffect, useState } from "react";

import { getDeviceDetailPopup } from "@/api";
import { normalizeDeviceDetail } from "@/app/modules/popup-view-model";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import DeviceMonitorHistoryLineChart from "./history-line-chart";

/**
 * 设备详情弹窗沿用设备监控弹窗壳子，内容区暂时留空。
 */
function DeviceMonitorDetailDialog({ open, onOpenChange, deviceDetail }) {
  const safeDeviceDetail = deviceDetail || {};
  const [dialogState, setDialogState] = useState({
    status: "idle",
    data: null,
    error: null,
  });
  const detailTitle =
    safeDeviceDetail.deviceCode
      ? `设备详情 ${safeDeviceDetail.deviceCode}`
      : "设备详情";

  useEffect(
    function requestDeviceDetailPopup() {
      if (!open || !safeDeviceDetail.deviceCode) {
        return;
      }

      let disposed = false;

      setDialogState({
        status: "loading",
        data: null,
        error: null,
      });

      getDeviceDetailPopup(safeDeviceDetail.deviceCode)
        .then(function handleSuccess(responseData) {
          if (disposed) {
            return;
          }

          setDialogState({
            status: "success",
            data: normalizeDeviceDetail(responseData),
            error: null,
          });
        })
        .catch(function handleError(error) {
          if (disposed) {
            return;
          }

          setDialogState({
            status: "error",
            data: null,
            error,
          });
        });

      return function cleanupDeviceDetailPopupRequest() {
        disposed = true;
      };
    },
    [open, safeDeviceDetail.deviceCode]
  );

  const detailData = dialogState.data || safeDeviceDetail;
  const historyDates = detailData.historyDates || [];
  const historyValues = detailData.historyValues || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[980px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[980px]">
        <div
          className="bd1 flex max-h-[min(780px,calc(100vh-3rem))] flex-col rounded-2xl bg-[#1b233a] px-4 py-4"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 95%) 0%, rgb(11 21 48 / 85%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              {detailTitle}
            </DialogTitle>
            <div className="pl-3">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    size="xs"
                    className="bg-[#0B1530]/35 rounded-[10px] w-12 h-8 text-xs border-[#1D3B7A]/75 leading-none hover:bg-[#00E7FF]/20 text-[#E8F0FF] font-thin"
                  />
                }>
                关闭
              </DialogClose>
            </div>
          </div>
          <hr className="text-[#1D3B7A]/35 my-3" />
          <ScrollArea className="min-h-0 flex-1">
            <div className="pr-3">
              <div className="mb-3 grid grid-cols-[1.1fr_1fr] gap-3.5">
                <Card title="设备信息">
                  <div className="mt-2 space-y-2.5">
                    <PItem l="设备编号" c={detailData.deviceCode}></PItem>
                    <PItem l="设备类型" c={detailData.deviceType}></PItem>
                    <PItem
                      l="设备状态"
                      c={
                        <span style={{ color: detailData.statusColor || "#F87171" }}>
                          {detailData.statusText}
                        </span>
                      }></PItem>
                    <PItem
                      l="检测项目"
                      c={detailData.metricName}></PItem>
                    <PItem l="最后更新" c={detailData.lastUpdateTime}></PItem>
                  </div>
                </Card>
                <Card title="患者信息">
                  <div className="mt-2 space-y-2.5">
                    <PItem l="患者姓名" c={detailData.patientName}></PItem>
                    <PItem l="性别" c={detailData.gender}></PItem>
                    <PItem l="年龄" c={detailData.age}></PItem>
                    <PItem l="联系电话" c={detailData.phone}></PItem>
                  </div>
                </Card>
                <Card title="医生信息">
                  <div className="mt-2 space-y-2.5">
                    <PItem l="医生姓名" c={detailData.doctorName}></PItem>
                    <PItem l="联系电话" c={detailData.doctorPhone}></PItem>
                  </div>
                </Card>
                <Card title="所属医院">
                  <div className="mt-2 space-y-2.5">
                    <PItem l="医院名称" c={detailData.hospitalName}></PItem>
                  </div>
                </Card>
              </div>
              <Card title="历史测量数据(近七天)">
                <div className="h-52 pt-2">
                  <DeviceMonitorHistoryLineChart
                    dates={historyDates}
                    values={historyValues}
                    className="h-full w-full"></DeviceMonitorHistoryLineChart>
                </div>
              </Card>
              <DialogStatus
                status={dialogState.status}
                error={dialogState.error}
                empty={dialogState.status === "success" && !dialogState.data}
                emptyText="暂无设备详情数据"
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeviceMonitorDetailDialog;

function Card({ title, children }) {
  return (
    <div className="bg-[#0B1530]/35 rounded-[10px] p-4.5 border border-[#1D3B7A]/55">
      <h6 className="text-sm font-bold text-[#9FB5DA]/95">{title}</h6>
      {children}
    </div>
  );
}

function PItem({ l, c }) {
  return (
    <div className=" flex items-start ">
      <span className="leading-none text-xs text-[#9FB5DA]/95 w-20">{l}</span>
      <p className="flex-1 flex-wrap leading-[16px] text-xs text-[#E8F0FF] font-bold">
        {c}
      </p>
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
