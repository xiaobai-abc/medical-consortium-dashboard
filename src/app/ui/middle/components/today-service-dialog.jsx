"use client";

import { useEffect, useState } from "react";

import { getServiceOverviewPopup } from "@/api";
import { normalizeServiceOverviewPopup } from "@/app/modules/popup-view-model";

import { Dialog, DialogContent, DialogTitle } from "@/shadcn/ui/dialog";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shadcn/ui/table";

import DialogCloseAction from "./dialog-close-action";
import DialogHeaderSelect from "./dialog-header-select";

const defaultServiceCenterOptions = [{ label: "全部卫生中心", value: "" }];
const defaultRiskLevelOptions = [{ label: "全部等级", value: "" }];

/**
 * “今日总服务人次”弹窗只处理两类事情：
 * 1. 维护当前筛选条件
 * 2. 基于筛选条件渲染卫生中心汇总表格
 * 这样和顶部卡片职责天然分离，后续替换业务字段也更安全。
 */
function TodayServiceDialog({ open, onOpenChange }) {
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("");
  const [dialogState, setDialogState] = useState({
    status: "idle",
    data: {
      centerOptions: defaultServiceCenterOptions,
      riskLevelOptions: defaultRiskLevelOptions,
      items: [],
    },
    error: null,
  });

  function handleCenterChange(nextCenter) {
    setSelectedCenter(nextCenter);
  }

  function handleRiskLevelChange(nextRiskLevel) {
    setSelectedRiskLevel(nextRiskLevel);
  }

  useEffect(
    function requestServiceOverviewPopup() {
      if (!open) {
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

      getServiceOverviewPopup({
        service_center: selectedCenter || undefined,
        risk_level: selectedRiskLevel || undefined,
      })
        .then(function handleSuccess(responseData) {
          if (disposed) {
            return;
          }

          setDialogState({
            status: "success",
            data: normalizeServiceOverviewPopup(
              responseData,
              defaultServiceCenterOptions,
              defaultRiskLevelOptions
            ),
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

      return function cleanupServiceOverviewPopupRequest() {
        disposed = true;
      };
    },
    [open, selectedCenter, selectedRiskLevel]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 w-[1200px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              今日总服务人次
            </DialogTitle>
            <DialogCloseAction />
          </div>
          <div className="pt-4">
            <ScrollArea className="h-[320px] w-full">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-[#1D3B7A]/80 hover:bg-transparent">
                    <TableHead className="h-14 pl-3">
                      <DialogHeaderSelect
                        value={selectedCenter}
                        options={dialogState.data.centerOptions}
                        onValueChange={handleCenterChange}
                        minWidthClassName="min-w-[132px]"
                      />
                    </TableHead>
                    <TableHead className="h-14 text-xs font-normal text-[#8FA8D3]">
                      今日服务总人次
                    </TableHead>
                    <TableHead className="h-14 text-xs font-normal text-[#8FA8D3]">
                      异常数据数量
                    </TableHead>
                    <TableHead className="h-14 pr-3">
                      <DialogHeaderSelect
                        value={selectedRiskLevel}
                        options={dialogState.data.riskLevelOptions}
                        onValueChange={handleRiskLevelChange}
                        minWidthClassName="min-w-[108px]"
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dialogState.data.items.map(function renderServiceRow(row) {
                    return (
                      <TableRow
                        key={row.id}
                        className="border-[#16325F]/70 hover:bg-[rgba(17,31,61,0.72)]">
                        <TableCell className="max-w-[220px] pl-3 text-sm text-[#AFC2E2]">
                          <span className="block truncate">{row.centerName}</span>
                        </TableCell>
                        <TableCell className="text-sm text-[#E8F0FF]">
                          {row.serviceCount}
                        </TableCell>
                        <TableCell className="text-sm text-[#E8F0FF]">
                          {row.abnormalCount}
                        </TableCell>
                        <TableCell
                          className="pr-3 text-sm"
                          style={{ color: row.riskLevelColor }}>
                          {row.riskLevel}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <DialogStatus
                status={dialogState.status}
                error={dialogState.error}
                empty={!dialogState.data.items.length}
                emptyText="暂无服务总览数据"
              />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TodayServiceDialog;

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
