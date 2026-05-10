"use client";

import { useEffect, useState } from "react";

import { getDeviceListPopup } from "@/api";
import { normalizeDeviceListPopup } from "@/app/modules/popup-view-model";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

import { useDeviceMonitorDialog } from "./context";
import DeviceMonitorDetailDialog from "./detail-dialog";
import DeviceMonitorFilterSelect from "./filter-select";

const dialogTitleMap = {
  all: "物联网设备监控",
  online: "在线设备数据情况",
  offline: "离线设备",
  total: "设备总数"
};

const deviceSummaryColumns = [
  [
    { label: "设备类型", key: "deviceType" },
    { label: "检测项目", key: "metricName" },
    { label: "所属医院", key: "hospitalName" }
  ],
  [
    { label: "最近更新", key: "lastUpdateTime" },
    { label: "患者姓名", key: "patientName" }
  ]
];

/**
 * 设备监控弹窗根组件在页面中只挂载一次，所有入口共享这一份实例。
 */
function DeviceMonitorDialogRoot() {
  const [activeDeviceDetail, setActiveDeviceDetail] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState("筛选设备");
  const [dialogState, setDialogState] = useState({
    status: "idle",
    data: {
      title: dialogTitleMap.all,
      deviceOptions: [{ label: "筛选设备", value: "" }],
      items: [],
    },
    error: null,
  });
  const { isOpen, dialogType, dialogPayload, closeDeviceMonitorDialog } =
    useDeviceMonitorDialog();
  const dialogTitle =
    dialogState.data.title ||
    dialogPayload?.title ||
    dialogTitleMap[dialogType] ||
    dialogTitleMap.all;
  const detailDialogOpen = Boolean(activeDeviceDetail);

  function clearActiveDeviceDetail() {
    setActiveDeviceDetail(null);
  }

  function handleDialogOpenChange(nextOpen) {
    if (nextOpen) {
      return;
    }

    clearActiveDeviceDetail();
    closeDeviceMonitorDialog();
  }

  function handleDetailOpenChange(nextOpen) {
    if (nextOpen) {
      return;
    }

    clearActiveDeviceDetail();
  }

  function handleDeviceClick(deviceItem) {
    setActiveDeviceDetail(deviceItem);
  }

  useEffect(
    function requestDeviceListPopup() {
      if (!isOpen) {
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

      getDeviceListPopup({
        dialog_type: dialogType,
        device_status: dialogPayload?.deviceStatus,
        hospital_name: dialogPayload?.hospitalName,
        device_type: selectedDeviceType === "筛选设备" ? undefined : selectedDeviceType,
      })
        .then(function handleSuccess(responseData) {
          if (disposed) {
            return;
          }

          setDialogState({
            status: "success",
            data: normalizeDeviceListPopup(
              responseData,
              dialogPayload?.title || dialogTitleMap[dialogType] || dialogTitleMap.all
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

      return function cleanupDeviceListPopupRequest() {
        disposed = true;
      };
    },
    [dialogPayload?.deviceStatus, dialogPayload?.hospitalName, dialogPayload?.title, dialogType, isOpen, selectedDeviceType]
  );

  useEffect(
    function resetDeviceFilterWhenDialogChanges() {
      if (!isOpen) {
        setSelectedDeviceType("筛选设备");
      }
    },
    [isOpen]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[980px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[980px]">
        <div
          className="bd1 flex max-h-[min(780px,calc(100vh-3rem))] flex-col rounded-2xl bg-[#1b233a] px-4 py-4"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              {dialogTitle}
            </DialogTitle>
            <div className="ml-auto mr-0">
              <DeviceMonitorFilterSelect
                value={selectedDeviceType}
                options={dialogState.data.deviceOptions}
                onValueChange={setSelectedDeviceType}
              />
            </div>
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
            <div className="space-y-3 pr-3">
              {dialogState.data.items.map(function renderDeviceCard(deviceItem) {
                return (
                  <DeviceCard
                    key={deviceItem.deviceCode}
                    deviceItem={deviceItem}
                    onClick={handleDeviceClick}
                  />
                );
              })}
            </div>
            <DialogStatus
              status={dialogState.status}
              error={dialogState.error}
              empty={!dialogState.data.items.length}
              emptyText="暂无设备列表数据"
            />
          </ScrollArea>
        </div>
      </DialogContent>
      <DeviceMonitorDetailDialog
        deviceDetail={activeDeviceDetail}
        open={detailDialogOpen}
        onOpenChange={handleDetailOpenChange}
      />
    </Dialog>
  );
}

export default DeviceMonitorDialogRoot;

function DeviceCard({ deviceItem, onClick }) {
  function handleClick() {
    onClick(deviceItem);
  }

  return (
    <div
      className="cursor-pointer rounded-[10px] border border-[#1D3B7A]/35 px-3.5 py-4.5 transition-colors hover:bg-[rgba(17,31,61,0.48)]"
      onClick={handleClick}>
      <div className="flex items-center justify-between">
        <h6 className="leading-none text-sm text-[#E8F0FF]/95 font-bold">
          {deviceItem.deviceCode}
        </h6>
        <div
          className="flex items-center justify-between px-2 py-1 rounded-[10px]"
          style={{
            border: `1px solid ${deviceItem.statusColor}59`
          }}>
          <span
            className="text-xs leading-none"
            style={{
              color: deviceItem.statusColor
            }}>
            {deviceItem.statusText}
          </span>
        </div>
      </div>
      <div className="flex mt-3">
        {deviceSummaryColumns.map(function renderColumn(columnItems, index) {
          return (
            <div key={index} className="space-y-2.5 flex-1">
              {columnItems.map(function renderItem(item) {
                return (
                  <ItemLab
                    key={item.key}
                    label={item.label}
                    content={deviceItem[item.key]}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemLab({ label, content }) {
  return (
    <div className="flex items-center">
      <span className="text-sm text-[#9FB5DA]/85">{label}:</span>
      <span className="text-sm text-[#E8F0FF]/90 ml-2">{content}</span>
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
