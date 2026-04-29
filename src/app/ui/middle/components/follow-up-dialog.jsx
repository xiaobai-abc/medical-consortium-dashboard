"use client";

import { useState } from "react";

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

import DialogCloseAction from "./dialog-close-action";
import DialogHeaderSelect from "./dialog-header-select";

const followUpTableRows = [
  {
    id: "FU-001",
    centerName: "仓前街道社区卫生服务中心",
    patientName: "张敏",
    metricName: "血压",
    statusText: "已随访",
    lastCheckTime: "2026-04-14 09:20"
  },
  {
    id: "FU-002",
    centerName: "桐君街道社区卫生服务中心",
    patientName: "李国强",
    metricName: "血糖",
    statusText: "待随访",
    lastCheckTime: "2026-04-14 10:45"
  },
  {
    id: "FU-003",
    centerName: "城南街道社区卫生服务中心",
    patientName: "周燕",
    metricName: "心率",
    statusText: "已随访",
    lastCheckTime: "2026-04-14 11:10"
  },
  {
    id: "FU-004",
    centerName: "凤川街道社区卫生服务中心",
    patientName: "王建华",
    metricName: "尿酸",
    statusText: "待随访",
    lastCheckTime: "2026-04-14 13:36"
  },
  {
    id: "FU-005",
    centerName: "分水镇中心卫生院",
    patientName: "陈秀英",
    metricName: "总胆固醇",
    statusText: "已随访",
    lastCheckTime: "2026-04-14 15:18"
  }
];

const followUpCenterOptions = [
  "全部卫生中心",
  "仓前街道社区卫生服务中心",
  "桐君街道社区卫生服务中心",
  "城南街道社区卫生服务中心",
  "凤川街道社区卫生服务中心"
];

const followUpMetricOptions = ["全部项目", "血压", "血糖", "心率", "尿酸"];

const followUpStatusOptions = ["是否已随访", "已随访", "待随访"];

/**
 * 重点随访列表目前先使用本地静态数据。
 * 过滤逻辑保持在当前文件内，便于后续替换成接口数据时只改这一层。
 */
function getFilteredFollowUpRows(
  selectedCenter,
  searchKeyword,
  selectedMetric,
  selectedStatus
) {
  const normalizedKeyword = searchKeyword.trim();

  return followUpTableRows.filter(function filterRow(row) {
    const matchesCenter =
      selectedCenter === followUpCenterOptions[0] ||
      row.centerName === selectedCenter;
    const matchesKeyword =
      normalizedKeyword === "" ||
      row.patientName.includes(normalizedKeyword) ||
      row.centerName.includes(normalizedKeyword);
    const matchesMetric =
      selectedMetric === followUpMetricOptions[0] ||
      row.metricName === selectedMetric;
    const matchesStatus =
      selectedStatus === followUpStatusOptions[0] ||
      row.statusText === selectedStatus;

    return matchesCenter && matchesKeyword && matchesMetric && matchesStatus;
  });
}

/**
 * 重点随访弹窗本身只处理筛选状态与表格渲染。
 * 卡片入口和具体展示结构保持分离，后续更换字段时影响面更小。
 */
function FollowUpDialog({ open, onOpenChange }) {
  const [selectedCenter, setSelectedCenter] = useState(followUpCenterOptions[0]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedMetric, setSelectedMetric] = useState(
    followUpMetricOptions[0]
  );
  const [selectedStatus, setSelectedStatus] = useState(
    followUpStatusOptions[0]
  );
  const filteredRows = getFilteredFollowUpRows(
    selectedCenter,
    searchKeyword,
    selectedMetric,
    selectedStatus
  );

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
                        options={followUpCenterOptions}
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
                        options={followUpMetricOptions}
                        onValueChange={handleMetricChange}
                        minWidthClassName="min-w-[108px]"
                      />
                    </TableHead>
                    <TableHead className="h-14 pr-3">
                      <DialogHeaderSelect
                        value={selectedStatus}
                        options={followUpStatusOptions}
                        onValueChange={handleStatusChange}
                        minWidthClassName="min-w-[108px]"
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map(function renderFollowUpRow(row) {
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
