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

function createInitialDialogData(title = dialogTitleMap.all) {
  return {
    title,
    deviceOptions: [{ label: "筛选设备", value: "" }],
    items: [],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
      hasMore: false,
    },
  };
}

function createLoadingDialogData(previousData, title = dialogTitleMap.all, page = 1) {
  const previousPagination = previousData?.pagination || {};
  const nextPageSize = previousData?.pagination?.pageSize || 10;

  return {
    title,
    deviceOptions:
      Array.isArray(previousData?.deviceOptions) && previousData.deviceOptions.length > 0
        ? previousData.deviceOptions
        : [{ label: "筛选设备", value: "" }],
    items: [],
    pagination: {
      page,
      pageSize: nextPageSize,
      total: previousPagination.total || 0,
      totalPages: previousPagination.totalPages || 1,
      hasMore: Boolean(previousPagination.hasMore),
    },
  };
}

function getDialogRequestKey(dialogType, dialogPayload) {
  return JSON.stringify({
    dialogType: dialogType || "all",
    deviceStatus: dialogPayload?.deviceStatus || "",
    hospitalName: dialogPayload?.hospitalName || "",
    title: dialogPayload?.title || "",
  });
}

/**
 * 设备监控弹窗根组件在页面中只挂载一次，所有入口共享这一份实例。
 */
function DeviceMonitorDialogRoot() {
  const [activeDeviceDetail, setActiveDeviceDetail] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDialogKey, setActiveDialogKey] = useState("");
  const [dialogState, setDialogState] = useState({
    status: "idle",
    data: createInitialDialogData(),
    error: null,
  });
  const { isOpen, dialogType, dialogPayload, closeDeviceMonitorDialog } =
    useDeviceMonitorDialog();
  const dialogRequestKey = getDialogRequestKey(dialogType, dialogPayload);
  const fallbackDialogTitle =
    dialogPayload?.title || dialogTitleMap[dialogType] || dialogTitleMap.all;
  const dialogTitle =
    dialogState.data.title ||
    fallbackDialogTitle;
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

  function handleDeviceTypeChange(nextDeviceType) {
    setCurrentPage(1);
    setSelectedDeviceType(nextDeviceType);
  }

  function handlePreviousPage() {
    setCurrentPage(function getPreviousPage(previousPage) {
      return Math.max(1, previousPage - 1);
    });
  }

  function handleNextPage() {
    setCurrentPage(function getNextPage(previousPage) {
      const totalPages = dialogState.data.pagination?.totalPages || 1;
      return Math.min(totalPages, previousPage + 1);
    });
  }

  useEffect(
    function syncDialogQueryState() {
      if (!isOpen) {
        setActiveDialogKey("");
        setSelectedDeviceType("");
        setCurrentPage(1);
        setDialogState({
          status: "idle",
          data: createInitialDialogData(),
          error: null,
        });
        return;
      }

      if (activeDialogKey === dialogRequestKey) {
        return;
      }

      clearActiveDeviceDetail();
      setActiveDialogKey(dialogRequestKey);
      setSelectedDeviceType("");
      setCurrentPage(1);
      setDialogState({
        status: "loading",
        data: createInitialDialogData(fallbackDialogTitle),
        error: null,
      });
    },
    [activeDialogKey, dialogRequestKey, fallbackDialogTitle, isOpen]
  );

  useEffect(
    function requestDeviceListPopup() {
      if (!isOpen || activeDialogKey !== dialogRequestKey) {
        return;
      }

      let disposed = false;

      setDialogState(function setLoadingState(previousState) {
        return {
          status: "loading",
          data: createLoadingDialogData(
            previousState.data,
            fallbackDialogTitle,
            currentPage
          ),
          error: null,
        };
      });

      getDeviceListPopup({
        /**
         * 这条接口当前确认过的筛选参数是：
         * - dialog_type
         * - device_status
         * - hospital_name
         * - device_type
         *
         * TODO:
         * 设备列表接口当前还没有确认真实分页能力是否已经上线。
         * 这里先把 page / page_size 的调用位预留出来，
         * 等后端正式补充分页参数和分页返回结构后，再回到这里接真分页逻辑。
         *
         * device_type 先按文档参数语义保留原始值，
         * 不再额外把“筛选设备”推断成 all。
         */
        dialog_type: dialogType,
        device_status: dialogPayload?.deviceStatus,
        hospital_name: dialogPayload?.hospitalName,
        device_type: selectedDeviceType,
        page: currentPage,
        page_size: 10,
      })
        .then(function handleSuccess(responseData) {
          if (disposed) {
            return;
          }

          setDialogState({
            status: "success",
            data: normalizeDeviceListPopup(
              responseData,
              fallbackDialogTitle
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
    [
      activeDialogKey,
      currentPage,
      dialogPayload?.deviceStatus,
      dialogPayload?.hospitalName,
      dialogPayload?.title,
      dialogType,
      dialogRequestKey,
      fallbackDialogTitle,
      isOpen,
      selectedDeviceType
    ]
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
                onValueChange={handleDeviceTypeChange}
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
          <ScrollArea className="min-h-[520px] flex-1">
            <div className="space-y-3 pr-3">
              {dialogState.data.items.map(function renderDeviceCard(deviceItem) {
                return (
                  <DeviceCard
                    key={deviceItem.id}
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
          <DeviceListPagination
            pagination={dialogState.data.pagination}
            disabled={dialogState.status === "loading"}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
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

function DeviceListPagination({
  pagination,
  disabled = false,
  onPreviousPage,
  onNextPage
}) {
  /**
   * TODO:
   * 当前分页条先按“兼容单页展示”保留在底部。
   * 如果后端暂时还没返回 pagination，这里会退化成 1 / 1。
   * 等接口正式补充分页后，再把页码、总数、上一页/下一页行为切到真实分页数据。
   */
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalCount = pagination?.total || 0;
  const canGoPrevious = !disabled && currentPage > 1;
  const canGoNext =
    !disabled &&
    (typeof pagination?.hasMore === "boolean"
      ? pagination.hasMore
      : currentPage < totalPages);

  return (
    <div className="mt-3 flex items-center justify-between border-t border-[#1D3B7A]/35 pt-3">
      <span className="text-xs text-[#9FB5DA]">
        共 {totalCount} 条，第 {currentPage} / {Math.max(totalPages, 1)} 页
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={!canGoPrevious}
          className="h-8 rounded-[10px] border-[#1D3B7A]/75 bg-[#0B1530]/35 px-3 text-xs text-[#E8F0FF] hover:bg-[#00E7FF]/20"
          onClick={onPreviousPage}>
          上一页
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={!canGoNext}
          className="h-8 rounded-[10px] border-[#1D3B7A]/75 bg-[#0B1530]/35 px-3 text-xs text-[#E8F0FF] hover:bg-[#00E7FF]/20"
          onClick={onNextPage}>
          下一页
        </Button>
      </div>
    </div>
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
