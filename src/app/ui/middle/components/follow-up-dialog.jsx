"use client";

import { cn } from "../../../../lib/utils";
import { Button } from "@/shadcn/ui/button";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shadcn/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shadcn/ui/table";

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

const followUpStatusOptions = ["全部状态", "已随访", "待随访"];

/**
 * 重点随访弹窗仅提供统一壳子，内容区留空给后续业务模块填充。
 */
function FollowUpDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 w-[1200px] bd">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              重点随访
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
          <div className="pt-4">
            {/* rounded-xl border border-[#1D3B7A]/75 bg-[rgba(8,18,40,0.76)] px-3 py-3 */}
            <div className="">
              <FollowUpFilterBar />
              <div className="pt-3">
                <ScrollArea className="h-[320px] w-full">
                  <Table className="min-w-full">
                    {/* <TableHeader>
                      <TableRow className="border-[#1D3B7A]/80 bg-[rgba(18,34,68,0.88)] hover:bg-[rgba(18,34,68,0.88)]">
                        <TableHead className="h-11 pl-3 text-xs font-normal text-[#8FA8D3]">
                          姓名
                        </TableHead>
                        <TableHead className="h-11 text-xs font-normal text-[#8FA8D3]">
                          卫生中心
                        </TableHead>
                        <TableHead className="h-11 text-xs font-normal text-[#8FA8D3]">
                          检测项目
                        </TableHead>
                        <TableHead className="h-11 text-xs font-normal text-[#8FA8D3]">
                          最近检测时间
                        </TableHead>
                        <TableHead className="h-11 pr-3 text-xs font-normal text-[#8FA8D3]">
                          随访状态
                        </TableHead>
                      </TableRow>
                    </TableHeader> */}
                    <TableBody>
                      {followUpTableRows.map(function renderFollowUpRow(row) {
                        return (
                          <TableRow
                            key={row.id}
                            className="border-[#16325F]/70 hover:bg-[rgba(17,31,61,0.72)]">
                            <TableCell className="pl-3 text-sm text-[#E8F0FF]">
                              {row.patientName}
                            </TableCell>
                            <TableCell className="max-w-[220px] text-sm text-[#AFC2E2]">
                              <span className="block truncate">
                                {row.centerName}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-[#C9D8F2]">
                              {row.metricName}
                            </TableCell>
                            <TableCell className="text-sm text-[#8FA8D3]">
                              {row.lastCheckTime}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 顶部筛选条先输出静态壳子，后续再接入真实查询状态。
 */
function FollowUpFilterBar() {
  return (
    <div className="pb-3">
      <div className="flex items-center flex-wrap">
        <FilterField label="卫生中心" className="w-[220px]">
          <Select defaultValue="全部卫生中心">
            <SelectTrigger
              size="sm"
              className="w-full border-[#1D3B7A]/80 bg-[rgba(13,27,56,0.92)] text-[#D6E0F5] hover:bg-[rgba(18,35,70,0.96)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-[#1D3B7A]/70 bg-[rgba(9,18,38,0.96)] text-[#D6E0F5]">
              <SelectGroup>
                {followUpCenterOptions.map(function renderCenterOption(option) {
                  return (
                    <SelectItem
                      key={option}
                      value={option}
                      className="rounded-[8px] text-xs focus:bg-[#1D3B7A]/50 focus:text-white">
                      {option}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="姓名" className="w-[220px] pl-3">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="请输入姓名"
              className="h-8 flex-1 rounded-[10px] border border-[#1D3B7A]/80 bg-[rgba(13,27,56,0.92)] px-3 text-sm text-[#D6E0F5] outline-none placeholder:text-[#6983B3] focus:border-[#2A62A7]"
            />
          </div>
        </FilterField>
        <FilterField label="检测项目" className="w-[160px] pl-3">
          <Select defaultValue="全部项目">
            <SelectTrigger
              size="sm"
              className="w-full border-[#1D3B7A]/80 bg-[rgba(13,27,56,0.92)] text-[#D6E0F5] hover:bg-[rgba(18,35,70,0.96)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-[#1D3B7A]/70 bg-[rgba(9,18,38,0.96)] text-[#D6E0F5]">
              <SelectGroup>
                {followUpMetricOptions.map(function renderMetricOption(option) {
                  return (
                    <SelectItem
                      key={option}
                      value={option}
                      className="rounded-[8px] text-xs focus:bg-[#1D3B7A]/50 focus:text-white">
                      {option}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="是否已随访" className="w-[160px] pl-3">
          <Select defaultValue="全部状态">
            <SelectTrigger
              size="sm"
              className="w-full border-[#1D3B7A]/80 bg-[rgba(13,27,56,0.92)] text-[#D6E0F5] hover:bg-[rgba(18,35,70,0.96)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-[#1D3B7A]/70 bg-[rgba(9,18,38,0.96)] text-[#D6E0F5]">
              <SelectGroup>
                {followUpStatusOptions.map(function renderStatusOption(option) {
                  return (
                    <SelectItem
                      key={option}
                      value={option}
                      className="rounded-[8px] text-xs focus:bg-[#1D3B7A]/50 focus:text-white">
                      {option}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterField>
      </div>
    </div>
  );
}

/**
 * 筛选项使用统一标题和宽度壳子，便于后续继续追加筛选条件。
 */
function FilterField({ label, className, children }) {
  return (
    <div className={className}>
      <div className="pb-2 text-xs leading-none text-[#7E99C7]">{label}</div>
      {children}
    </div>
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
