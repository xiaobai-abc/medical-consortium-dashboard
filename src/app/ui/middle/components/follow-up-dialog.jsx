"use client";

import { useEffect, useState } from "react";

import { cn } from "../../../../lib/utils";
import { SearchIcon } from "lucide-react";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/shadcn/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shadcn/ui/table";

import { getFollowUpPopup } from "@/api";
import { normalizeFollowUpPopup } from "@/app/modules/popup-view-model";
import DialogCloseAction from "./dialog-close-action";
import DialogHeaderSelect from "./dialog-header-select";

const defaultCenterOptions = [{ label: "全部卫生中心", value: "" }];
const defaultMetricOptions = [{ label: "全部项目", value: "" }];
const defaultStatusOptions = [{ label: "是否已随访", value: "" }];

/**
 * 重点随访弹窗本身只处理筛选状态与表格渲染。
 * 卡片入口和具体展示结构保持分离，后续更换字段时影响面更小。
 */
function FollowUpDialog({ open, onOpenChange }) {
  const [selectedCenter, setSelectedCenter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dialogState, setDialogState] = useState({
    status: "idle",
    data: {
      centerOptions: defaultCenterOptions,
      metricOptions: defaultMetricOptions,
      statusOptions: defaultStatusOptions,
      items: [],
    },
    error: null,
  });

  function handleCenterChange(nextCenter) {
    setSelectedCenter(nextCenter);
  }

  function handleSearchKeywordChange(event) {
    setSearchKeyword(event.target.value);
  }

  function handleMetricChange(nextMetric) {
    setSelectedMetric(nextMetric);
  }

  function handleStatusChange(nextStatus) {
    setSelectedStatus(nextStatus);
  }

  useEffect(
    function requestFollowUpPopup() {
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

      getFollowUpPopup({
        service_center: selectedCenter || undefined,
        keyword: searchKeyword.trim() || undefined,
        metric: selectedMetric || undefined,
        follow_up_status: selectedStatus || undefined,
      })
        .then(function handleSuccess(responseData) {
          if (disposed) {
            return;
          }

          setDialogState({
            status: "success",
            data: normalizeFollowUpPopup(
              responseData,
              defaultCenterOptions,
              defaultMetricOptions,
              defaultStatusOptions
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

      return function cleanupFollowUpPopupRequest() {
        disposed = true;
      };
    },
    [open, searchKeyword, selectedCenter, selectedMetric, selectedStatus]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 w-[1200px]">
        <div
          className="rounded-2xl px-4 py-4 flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              重点随访
            </DialogTitle>
            <div className="flex items-center">
              <div className="relative mr-3">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#6983B3]" />
                <input
                  type="text"
                  value={searchKeyword}
                  placeholder="搜索患者姓名、社区..."
                  onChange={handleSearchKeywordChange}
                  className="h-8 w-[220px] rounded-[10px] border border-[#1D3B7A]/80 bg-[rgba(13,27,56,0.92)] pr-3 pl-9 text-sm text-[#D6E0F5] outline-none placeholder:text-[#6983B3] focus:border-[#2A62A7]"
                />
              </div>
              <DialogCloseAction />
            </div>
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
                    <TableHead className="h-14">
                      <span className="text-xs font-normal text-[#8FA8D3]">
                        姓名
                      </span>
                    </TableHead>
                    <TableHead className="h-14">
                      <DialogHeaderSelect
                        value={selectedMetric}
                        options={dialogState.data.metricOptions}
                        onValueChange={handleMetricChange}
                        minWidthClassName="min-w-[108px]"
                      />
                    </TableHead>
                    <TableHead className="h-14 pr-3">
                      <DialogHeaderSelect
                        value={selectedStatus}
                        options={dialogState.data.statusOptions}
                        onValueChange={handleStatusChange}
                        minWidthClassName="min-w-[108px]"
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dialogState.data.items.map(function renderFollowUpRow(row) {
                    return (
                      <TableRow
                        key={row.id}
                        className="border-[#16325F]/70 hover:bg-[rgba(17,31,61,0.72)]">
                        <TableCell className="max-w-[220px] pl-3 text-sm text-[#AFC2E2]">
                          <span className="block truncate">
                            {row.centerName}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-[#E8F0FF]">
                          {row.patientName}
                        </TableCell>
                        <TableCell className="text-sm text-[#C9D8F2]">
                          {row.metricName}
                        </TableCell>
                        <TableCell className="pr-3">
                          <FollowUpStatusTag statusText={row.statusText} />
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
                emptyText="暂无重点随访数据"
              />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 表格状态标签沿用当前大屏蓝紫体系，先区分已随访和待随访两类状态。
 */
function FollowUpStatusTag({ statusText }) {
  const isCompleted = statusText === "已随访";

  return (
    <span className="inline-flex items-center text-xs text-[#D7E3F8]">
      <i
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: isCompleted ? "#22C55E" : "#EF4444"
        }}
      />
      <span
        className={cn(
          "ml-2",
          isCompleted ? "text-[#22C55E]" : "text-[#EF4444]"
        )}>
        {statusText}
      </span>
    </span>
  );
}

export default FollowUpDialog;

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
