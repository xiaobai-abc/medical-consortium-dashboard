"use client";

import { useState } from "react";

import ScreenLineTrendChart from "@/app/components/screen-line-trend-chart";
import { Button } from "@/shadcn/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { cn } from "../../../lib/utils";

const trendMetricList = [
  {
    key: "bloodPressure",
    label: "血压",
    data: [
      { date: "03-16", value: 148 },
      { date: "03-21", value: 172 },
      { date: "03-26", value: 135 },
      { date: "03-31", value: 194 },
      { date: "04-05", value: 168 },
      { date: "04-10", value: 126 },
      { date: "04-14", value: 156 },
    ],
  },
  {
    key: "bloodSugar",
    label: "血糖",
    data: [
      { date: "03-16", value: 118 },
      { date: "03-21", value: 136 },
      { date: "03-26", value: 129 },
      { date: "03-31", value: 167 },
      { date: "04-05", value: 154 },
      { date: "04-10", value: 132 },
      { date: "04-14", value: 145 },
    ],
  },
  {
    key: "heartRate",
    label: "心率",
    data: [
      { date: "03-16", value: 92 },
      { date: "03-21", value: 108 },
      { date: "03-26", value: 96 },
      { date: "03-31", value: 126 },
      { date: "04-05", value: 114 },
      { date: "04-10", value: 88 },
      { date: "04-14", value: 103 },
    ],
  },
  {
    key: "cholesterol",
    label: "总胆固醇",
    data: [
      { date: "03-16", value: 74 },
      { date: "03-21", value: 96 },
      { date: "03-26", value: 88 },
      { date: "03-31", value: 121 },
      { date: "04-05", value: 104 },
      { date: "04-10", value: 81 },
      { date: "04-14", value: 93 },
    ],
  },
  {
    key: "uricAcid",
    label: "尿酸",
    data: [
      { date: "03-16", value: 66 },
      { date: "03-21", value: 86 },
      { date: "03-26", value: 77 },
      { date: "03-31", value: 108 },
      { date: "04-05", value: 92 },
      { date: "04-10", value: 71 },
      { date: "04-14", value: 81 },
    ],
  },
  {
    key: "triglyceride",
    label: "甘油三酯",
    data: [
      { date: "03-16", value: 58 },
      { date: "03-21", value: 72 },
      { date: "03-26", value: 69 },
      { date: "03-31", value: 96 },
      { date: "04-05", value: 84 },
      { date: "04-10", value: 63 },
      { date: "04-14", value: 71 },
    ],
  },
  {
    key: "ldl",
    label: "低密度脂蛋白",
    data: [
      { date: "03-16", value: 49 },
      { date: "03-21", value: 62 },
      { date: "03-26", value: 58 },
      { date: "03-31", value: 84 },
      { date: "04-05", value: 71 },
      { date: "04-10", value: 55 },
      { date: "04-14", value: 61 },
    ],
  },
  {
    key: "hdl",
    label: "高密度脂蛋白",
    data: [
      { date: "03-16", value: 41 },
      { date: "03-21", value: 54 },
      { date: "03-26", value: 49 },
      { date: "03-31", value: 65 },
      { date: "04-05", value: 58 },
      { date: "04-10", value: 43 },
      { date: "04-14", value: 47 },
    ],
  },
  {
    key: "hemoglobin",
    label: "血红蛋白",
    data: [
      { date: "03-16", value: 44 },
      { date: "03-21", value: 57 },
      { date: "03-26", value: 53 },
      { date: "03-31", value: 69 },
      { date: "04-05", value: 59 },
      { date: "04-10", value: 46 },
      { date: "04-14", value: 52 },
    ],
  },
  {
    key: "creatinine",
    label: "肌酐",
    data: [
      { date: "03-16", value: 38 },
      { date: "03-21", value: 51 },
      { date: "03-26", value: 45 },
      { date: "03-31", value: 63 },
      { date: "04-05", value: 56 },
      { date: "04-10", value: 39 },
      { date: "04-14", value: 48 },
    ],
  },
  {
    key: "ketone",
    label: "血酮",
    data: [
      { date: "03-16", value: 27 },
      { date: "03-21", value: 35 },
      { date: "03-26", value: 32 },
      { date: "03-31", value: 46 },
      { date: "04-05", value: 41 },
      { date: "04-10", value: 30 },
      { date: "04-14", value: 33 },
    ],
  },
  {
    key: "lacticAcid",
    label: "乳酸",
    data: [
      { date: "03-16", value: 53 },
      { date: "03-21", value: 68 },
      { date: "03-26", value: 60 },
      { date: "03-31", value: 82 },
      { date: "04-05", value: 71 },
      { date: "04-10", value: 56 },
      { date: "04-14", value: 64 },
    ],
  },
];

const primaryMetricList = trendMetricList.slice(0, 4);
const secondaryMetricList = trendMetricList.slice(4);

function LeftL2() {
  const [activeMetricKey, setActiveMetricKey] = useState("bloodPressure");
  const activeMetric =
    trendMetricList.find(function findMetric(item) {
      return item.key === activeMetricKey;
    }) || trendMetricList[0];
  const dates = activeMetric.data.map(function mapDate(item) {
    return item.date;
  });
  const values = activeMetric.data.map(function mapValue(item) {
    return item.value;
  });
  const isActiveMetricInSelect = secondaryMetricList.some(function hasMetric(item) {
    return item.key === activeMetricKey;
  });

  return (
    <div className="w-full h-[320px] bd1 rounded-2xl px-3.5 py-4 flex flex-col">
      <div className="w-full flex items-center mb-3">
        <h3 className="text-sm text-[#9FB5DA]">近30日异常数据报警趋势</h3>
        <div
          className="h-[1px] w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(155, 109, 247, 0.4) 0%, transparent 100%)"
          }}
        />
      </div>
      {/* 选择部分 */}
      <div className="mb-3 flex items-center">
        <div className="flex flex-wrap flex-1">
          {primaryMetricList.map(function renderPrimaryMetric(item, index) {
            return (
              <MetricButton
                key={item.key}
                isActive={item.key === activeMetricKey}
                className={index === 0 ? "" : "ml-2"}
                onClick={function handleClick() {
                  setActiveMetricKey(item.key);
                }}
              >
                {item.label}
              </MetricButton>
            );
          })}
        </div>
        <div className="pl-2">
          <Select
            value={isActiveMetricInSelect ? activeMetricKey : ""}
            onValueChange={function handleValueChange(value) {
              setActiveMetricKey(value);
            }}
          >
            <SelectTrigger
              className="h-8 min-w-[96px] rounded-[10px] border border-[#7F69D7]/55 bg-[rgba(12,24,52,0.88)] px-3 text-xs text-[#D6E0F5] hover:bg-[rgba(16,30,61,0.96)]"
              size="sm"
            >
              <SelectValue>
                {isActiveMetricInSelect ? activeMetric.label : "更多指标"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border border-[#7F69D7]/35 bg-[rgba(9,18,38,0.96)] text-[#D6E0F5]">
              {secondaryMetricList.map(function renderSecondaryMetric(item) {
                return (
                  <SelectItem
                    key={item.key}
                    value={item.key}
                    className="rounded-[8px] text-xs focus:bg-[#776cdb]/18 focus:text-white"
                  >
                    {item.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 rounded-2xl border border-[#7F69D7]/18 bg-[rgba(10,23,47,0.45)] px-3 py-3">
        <ScreenLineTrendChart
          dates={dates}
          values={values}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

export default LeftL2;

function MetricButton({ children, isActive, className, onClick }) {
  return (
    <Button
      className={cn(
        "bg-[#00E7FF]/13 rounded-3xl px-3 py-1.5 text-xs border-[#00E7FF]/65 leading-none h-fit hover:bg-[#00E7FF]/20 transition-colors",
        isActive
          ? "border-[#00E7FF]/65 bg-[#00E7FF]/13 text-[#E8F8FF] hover:bg-[#00E7FF]/20"
          : "border-[#3D5A8A]/65 bg-[rgba(13,27,56,0.78)] text-[#9FB5DA] hover:bg-[rgba(21,39,75,0.92)]",
        className
      )}
      variant="outline"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

   

