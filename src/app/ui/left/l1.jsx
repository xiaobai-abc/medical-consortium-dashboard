"use client";

import { useState } from "react";

import ScreenProgress from "@/app/components/screen-progress";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

const measurementItems = [
  {
    title: "血压",
    value: 12426,
    colors: ["#59c2dd", "#55b8d8", "#476fb4"]
  },
  {
    title: "血糖",
    value: 8273,
    colors: ["#776cdb", "#55b8d8", "#476fb4"]
  },
  {
    title: "心率",
    value: 6958,
    colors: ["#59c2dd", "#55b8d8", "#476fb4"]
  },
  {
    title: "总胆固醇",
    value: 5261,
    colors: ["#776cdb", "#55b8d8", "#4470b1"]
  },
  {
    title: "尿酸",
    value: 4213,
    colors: ["#59c2dd", "#55b8d8", "#4470b1"]
  },
  {
    title: "甘油三酯",
    value: 2931,
    colors: ["#59c2dd", "#5dc18c", "#3e8a9f"]
  },
  {
    title: "低密度脂蛋白",
    value: 2603,
    colors: ["#776cdb", "#55b8d8", "#4470b1"]
  },
  {
    title: "高密度脂蛋白",
    value: 2064,
    colors: ["#59c2dd", "#5dc18c", "#3e8a9f"]
  },
  {
    title: "血红蛋白",
    value: 1948,
    colors: ["#59c2dd", "#55b8d8", "#4470b1"]
  },
  {
    title: "肌酐",
    value: 1837,
    colors: ["#776cdb", "#55b8d8", "#4470b1"]
  },
  {
    title: "血酮",
    value: 1258,
    colors: ["#59c2dd", "#5dc18c", "#3e8a9f"]
  },
  {
    title: "乳酸",
    value: 3125,
    colors: ["#776cdb", "#55b8d8", "#4470b1"]
  }
];

const maxMeasurementValue = measurementItems.reduce(function getMaxValue(
  currentMaxValue,
  currentItem
) {
  return Math.max(currentMaxValue, currentItem.value);
}, 0);

function LeftL1() {
  const [activeMeasurementItem, setActiveMeasurementItem] = useState(null);

  return (
    <div
      className="w-full flex-1 h-0 mb-3 bd1 rounded-2xl py-4 px-3.5 flex flex-col"
      style={{
        background:
          "linear-gradient(rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}>
      <div className="w-full flex items-center mb-3">
        <h3 className="text-sm text-[#9FB5DA]">检测项目数据统计</h3>
        <div
          className="h-px w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
          }}></div>
      </div>
      <div className="flex-1 h-0 mb-4">
        <ScrollArea className={cn("h-full")}>
          <div className="pr-2">
            {measurementItems.map(function renderMeasurementItem(item, index) {
              return (
                <ProgressBlock
                  key={`${item.title}-${item.value}`}
                  title={item.title}
                  value={item.value}
                  progress={Math.round(
                    (item.value / maxMeasurementValue) * 100
                  )}
                  colors={item.colors}
                  className={index === 0 ? "" : "pt-4"}
                  onClick={function handleClick() {
                    setActiveMeasurementItem(item);
                  }}
                />
              );
            })}
          </div>
        </ScrollArea>
      </div>
      <div className="flex items-center">
        <div className=" rounded-[50px] bd1 border-[#00E7FF]/35 px-5 py-2 flex-1">
          <h5 className="text-[#9FB5DA] text-xs mb-1">总测量次数</h5>
          <span className="text-[22px] text-[#00E7FF] leading-none">
            49,772
          </span>
        </div>
        <div className=" rounded-[50px] bd1 border-[#00E7FF]/35 flex-1 ml-4 px-5 py-2">
          <h5 className="text-[#9FB5DA] text-xs mb-1">异常数据占比</h5>
          <span className="text-[22px] text-[#986df7] leading-none">13.7%</span>
        </div>
      </div>
      <MeasurementDialog
        activeMeasurementItem={activeMeasurementItem}
        onOpenChange={function handleDialogOpenChange(nextOpen) {
          if (!nextOpen) {
            setActiveMeasurementItem(null);
          }
        }}
      />
    </div>
  );
}

/**
 * 进度块仅负责展示单项统计，并响应点击打开详情弹窗。
 */
function ProgressBlock({ title, value, progress, colors, className, onClick }) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-xl transition-colors hover:bg-white/[0.03]",
        className
      )}
      onClick={onClick}>
      <div className="flex items-center justify-between">
        <h5 className="text-[13px] text-[#E8F0FF] leading-none tracking-[0.04em]">
          {title}
        </h5>
        <span className="text-[12px] text-[#A9B8D8] leading-none tracking-[0.08em]">
          {value.toLocaleString("zh-CN")}
        </span>
      </div>
      <div className="pt-2">
        <ScreenProgress
          progress={progress}
          colors={colors}
          trackClassName="border border-[#1E4B87]/70 bg-transparent"
          barClassName="shadow-[0_0_14px_rgba(89,194,221,0.28)]"
        />
      </div>
    </div>
  );
}

/**
 * 详情弹窗使用右侧卡片同款壳子，内容区留空供后续补充。
 */
function MeasurementDialog({ activeMeasurementItem, onOpenChange }) {
  return (
    <Dialog open={Boolean(activeMeasurementItem)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[760px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[760px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-base text-white font-bold">
              {activeMeasurementItem
                ? activeMeasurementItem.title + "数据统计"
                : ""}
            </h2>

            <div className="pl-3">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    size="xs"
                    className="bg-[#1D3B7A]/75 rounded-[10px] w-12 h-7 text-xs border-[#1D3B7A]/75 leading-none hover:bg-[#00E7FF]/20 text-[#E8F0FF] font-thin"
                  />
                }>
                关闭
              </DialogClose>
            </div>
          </div>
          <div className="flex gap-x-3">
            <div className="px-3 py-3.5 bg-[rgba(29,59,122,0.3)] flex-1">
              <h6 className="text-[#9fb5da] mb-2">总测量次数</h6>
              <span className="text-[rgba(232,240,255,0.95)] text-[20px] leading-none">
                49,772
              </span>
            </div>
            <div className="px-3 py-3.5 bg-[rgba(29,59,122,0.3)] flex-1">
              <h6 className="text-[#9fb5da] mb-2">异常数据</h6>
              <span className="text-[rgba(255,77,79,0.95)] text-[20px] leading-none">
                286
              </span>
            </div>
          </div>
          <h2 className="text-base text-white font-bold my-3">
            测量值与异常值占比
          </h2>
          <div className="bg-[rgba(29,59,122,0.2)] p-3">
            <div className="flex items-center">
              <span className="w-20 ">正常值:</span>
              <div className="flex-1 h-6 rounded-[5px] relative overflow-hidden">
                <div className="bg-[rgba(0,231,255,0.6)] h-full w-[87%]"></div>
                <span className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#E8F0FF] leading-none">
                  87%
                </span>
              </div>
              <span className="text-ms text-[rgba(232,240,255,0.88)] leading-none ml-2">
                1910次
              </span>
            </div>
            <div className="flex items-center mt-2">
              <span className="w-20 ">异常值:</span>
              <div className="flex-1 h-6 rounded-[5px] relative overflow-hidden">
                <div className="bg-[#ad4b52] h-full w-[13%]"></div>
                <span className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#E8F0FF] leading-none">
                  13%
                </span>
              </div>
              <span className="text-ms text-[rgba(232,240,255,0.88)] leading-none ml-2">
                1910次
              </span>
            </div>
          </div>
          <h2 className="text-base text-white font-bold my-3">所有指标对比</h2>
          {/* <ScrollArea className={cn("h-[520px] ")}></ScrollArea> */}
          <div className=" space-y-2">
            {measurementItems.map((item) => {
              return (
                <div
                  key={item.title}
                  className={cn(
                    "p-3 bg-[rgba(29,59,122,0.2)] hover:bg-[rgba(29,59,122,0.4)] transition-colors duration-300",
                    "rounded-[3px] flex items-center justify-between"
                  )}>
                  <span className=" leading-none text-sm text-[#e8f0ff] ">
                    {item.title}
                  </span>
                  <span className="leading-none text-sm text-[rgba(159,181,218,0.9)] ">
                    <span className="mr-1">测量: 8530 </span>
                    异常: 1280(15.0%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LeftL1;
