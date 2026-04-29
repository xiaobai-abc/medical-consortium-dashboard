"use client";

import { useState } from "react";

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

const serviceCenterOptions = [
  "全部卫生中心",
  "仓前街道社区卫生服务中心",
  "桐君街道社区卫生服务中心",
  "城南街道社区卫生服务中心",
  "凤川街道社区卫生服务中心"
];

const riskLevelOptions = ["全部等级", "高风险", "中风险", "低风险"];

const serviceTableRows = [
  {
    id: "SR-001",
    centerName: "仓前街道社区卫生服务中心",
    serviceCount: 325,
    abnormalCount: 18,
    riskLevel: "高风险",
    riskLevelColor: "#FF7A7A"
  },
  {
    id: "SR-002",
    centerName: "桐君街道社区卫生服务中心",
    serviceCount: 286,
    abnormalCount: 11,
    riskLevel: "中风险",
    riskLevelColor: "#FFC857"
  },
  {
    id: "SR-003",
    centerName: "城南街道社区卫生服务中心",
    serviceCount: 241,
    abnormalCount: 6,
    riskLevel: "低风险",
    riskLevelColor: "#7EF0B1"
  },
  {
    id: "SR-004",
    centerName: "凤川街道社区卫生服务中心",
    serviceCount: 198,
    abnormalCount: 15,
    riskLevel: "高风险",
    riskLevelColor: "#FF7A7A"
  },
  {
    id: "SR-005",
    centerName: "良渚街道社区卫生服务中心",
    serviceCount: 176,
    abnormalCount: 9,
    riskLevel: "中风险",
    riskLevelColor: "#FFC857"
  }
];

/**
 * 这里先用“卫生中心维度”的静态汇总数据。
 * 后续如果接真实接口，只需要替换这一层数据来源和过滤逻辑，
 * 表格列结构与筛选交互都可以保持不变。
 */
function getFilteredServiceRows(selectedCenter, selectedRiskLevel) {
  return serviceTableRows.filter(function filterRow(row) {
    const matchesCenter =
      selectedCenter === serviceCenterOptions[0] ||
      row.centerName === selectedCenter;
    const matchesRiskLevel =
      selectedRiskLevel === riskLevelOptions[0] ||
      row.riskLevel === selectedRiskLevel;

    return matchesCenter && matchesRiskLevel;
  });
}

/**
 * “今日总服务人次”弹窗只处理两类事情：
 * 1. 维护当前筛选条件
 * 2. 基于筛选条件渲染卫生中心汇总表格
 * 这样和顶部卡片职责天然分离，后续替换业务字段也更安全。
 */
function TodayServiceDialog({ open, onOpenChange }) {
  const [selectedCenter, setSelectedCenter] = useState(serviceCenterOptions[0]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(
    riskLevelOptions[0]
  );
  const filteredRows = getFilteredServiceRows(
    selectedCenter,
    selectedRiskLevel
  );

  function handleCenterChange(nextCenter) {
    setSelectedCenter(nextCenter);
  }

  function handleRiskLevelChange(nextRiskLevel) {
    setSelectedRiskLevel(nextRiskLevel);
  }

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
                        options={serviceCenterOptions}
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
                        options={riskLevelOptions}
                        onValueChange={handleRiskLevelChange}
                        minWidthClassName="min-w-[108px]"
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map(function renderServiceRow(row) {
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
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TodayServiceDialog;
