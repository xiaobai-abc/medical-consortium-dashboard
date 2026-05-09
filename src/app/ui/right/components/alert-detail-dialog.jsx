"use client";

import { useEffect, useState } from "react";

import { getWarningDetailPopup } from "@/api";
import { normalizeWarningDetail } from "@/app/modules/popup-view-model";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import DeviceMonitorHistoryLineChart from "../../components/device-monitor-dialog/history-line-chart";

/**
 * 异常预警详情弹窗复用现有大屏弹窗壳子，内容区暂时留空。
 */
function RightAlertDetailDialog({ open, onOpenChange, alertDetail }) {
  const safeAlertDetail = alertDetail || {};
  const detailTitle = safeAlertDetail.metricName
    ? `${safeAlertDetail.metricName}异常预警`
    : "异常预警详情";
  const [dialogState, setDialogState] = useState({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(
    function requestWarningDetailPopup() {
      if (!open || !safeAlertDetail.id) {
        return;
      }

      let disposed = false;

      setDialogState({
        status: "loading",
        data: null,
        error: null,
      });

      getWarningDetailPopup(safeAlertDetail.id)
        .then(function handleSuccess(responseData) {
          if (disposed) {
            return;
          }

          setDialogState({
            status: "success",
            data: normalizeWarningDetail(responseData),
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

      return function cleanupWarningDetailPopupRequest() {
        disposed = true;
      };
    },
    [open, safeAlertDetail.id]
  );

  const detailData = dialogState.data || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[980px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[980px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col bg-[#1b233a]"
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
          <div className="min-h-[460px]">
            <div className="flex gap-x-3">
              <Card title="预警级别">
                <h2
                  className="text-lg font-bold leading-none"
                  style={{
                    color: detailData.warningLevelColor || "#FFCC66",
                  }}>
                  {dialogState.status === "loading"
                    ? "..."
                    : dialogState.status === "error"
                      ? "-"
                      : detailData.warningLevel || "-"}
                </h2>
              </Card>
              <Card title="发生事件">
                <span className="text-xl text-[#E8F0FF]/95 font-bold leading-none">
                  {dialogState.status === "loading"
                    ? "..."
                    : dialogState.status === "error"
                      ? "-"
                      : detailData.occurredAt || "-"}
                </span>
              </Card>
            </div>
            <div className="bg-[#1D3B7A]/35 rounded-[10px] p-3 border border-[#1D3B7A]/55 flex-1 my-3">
              <PItem l="指标" c={detailData.metricLabel || "-"}></PItem>
              <PItem l="测量值" c={detailData.measurementValue || "-"}></PItem>
              <PItem l="机构" c={detailData.location || "-"}></PItem>
              <PItem l="预警编号" c={detailData.warningId || "-"}></PItem>
            </div>
            <div className="flex gap-x-3">
              <Card title="患者信息">
                <div>
                  <PItem l="患者姓名" c={detailData.patientName || "-"}></PItem>
                  <PItem l="性别" c={detailData.patientGender || "-"}></PItem>
                  <PItem l="年龄" c={detailData.patientAge || "-"}></PItem>
                  <PItem l="联系电话" c={detailData.patientPhone || "-"}></PItem>
                </div>
              </Card>
              <Card title="医生信息">
                <PItem l="医生姓名" c={detailData.doctorName || "-"}></PItem>
                <PItem l="联系电话" c={detailData.doctorPhone || "-"}></PItem>
              </Card>
            </div>
            <Card title="近 7 天历史测量曲线">
              <div className="h-52 pt-2">
                <DeviceMonitorHistoryLineChart
                  dates={detailData.historyDates || []}
                  values={detailData.historyValues || []}
                  className="h-full w-full"></DeviceMonitorHistoryLineChart>
              </div>
            </Card>
            <DialogStatus
              status={dialogState.status}
              error={dialogState.error}
              empty={dialogState.status === "success" && !dialogState.data}
              emptyText="暂无预警详情数据"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RightAlertDetailDialog;

function Card({ title, children }) {
  return (
    <div className="bg-[#1D3B7A]/35 rounded-[10px] p-3 border border-[#1D3B7A]/55 flex-1">
      <h6 className="text-sm font-bold text-[#9FB5DA]/95 mb-1">{title}</h6>
      {children}
    </div>
  );
}

function PItem({ l, c }) {
  return (
    <div className=" flex items-start ">
      <span className="leading-none text-xs text-[#9FB5DA]/95 w-20">{l}</span>
      <p className="flex-1 flex-wrap leading-[16px] text-xs text-[#E8F0FF]/90 font-bold">
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
