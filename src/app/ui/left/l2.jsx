"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import ScreenLineTrendChart from "@/app/components/screen-line-trend-chart";
import { Button } from "@/shadcn/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shadcn/ui/select";
import { cn } from "../../../lib/utils";

const METRIC_BUTTON_GAP = 8;
const METRIC_SELECT_WIDTH = 112;

function LeftL2({ warningTrends, dashboardStatus, dashboardError }) {
  const trendMetricList = warningTrends?.metrics || [];
  const metricLayoutSignature = useMemo(
    function buildMetricLayoutSignature() {
      return trendMetricList
        .map(function mapMetric(item) {
          return `${item.key}:${item.label}`;
        })
        .join("|");
    },
    [trendMetricList]
  );
  const [activeMetricKey, setActiveMetricKey] = useState(
    warningTrends?.defaultMetricKey || trendMetricList[0]?.key || ""
  );
  const [visiblePrimaryMetricCount, setVisiblePrimaryMetricCount] = useState(
    trendMetricList.length
  );
  const metricControlRowRef = useRef(null);
  const primaryMetricRowRef = useRef(null);
  const metricMeasureRefs = useRef(new Map());
  const activeMetric =
    trendMetricList.find(function findMetric(item) {
      return item.key === activeMetricKey;
    }) || trendMetricList[0];
  const dates = activeMetric?.data?.map(function mapDate(item) {
    return item.date;
  }) || [];
  const values = activeMetric?.data?.map(function mapValue(item) {
    return item.value;
  }) || [];
  const primaryMetricList = trendMetricList.slice(0, visiblePrimaryMetricCount);
  const secondaryMetricList = trendMetricList.slice(visiblePrimaryMetricCount);
  const isActiveMetricInSelect = secondaryMetricList.some(
    function hasMetric(item) {
      return item.key === activeMetricKey;
    }
  );
  const hasTrendData = trendMetricList.length > 0;

  useEffect(
    function syncActiveMetricKey() {
      if (!hasTrendData) {
        setActiveMetricKey("");
        return;
      }

      const nextMetricKey = trendMetricList.some(function hasMetric(metric) {
        return metric.key === activeMetricKey;
      })
        ? activeMetricKey
        : warningTrends?.defaultMetricKey || trendMetricList[0]?.key || "";

      if (nextMetricKey !== activeMetricKey) {
        setActiveMetricKey(nextMetricKey);
      }
    },
    [activeMetricKey, hasTrendData, trendMetricList, warningTrends?.defaultMetricKey]
  );

  useLayoutEffect(
    function syncVisiblePrimaryMetricCount() {
      const metricControlRowElement = metricControlRowRef.current;

      if (!metricControlRowElement || trendMetricList.length === 0) {
        setVisiblePrimaryMetricCount(0);
        return;
      }

      function getMetricButtonWidth(item) {
        return metricMeasureRefs.current.get(item.key)?.offsetWidth || 0;
      }

      function getMetricsTotalWidth(metricList) {
        return metricList.reduce(function sumMetricWidth(totalWidth, item, index) {
          const metricWidth = getMetricButtonWidth(item);

          if (metricWidth === 0) {
            return totalWidth;
          }

          return totalWidth + metricWidth + (index === 0 ? 0 : METRIC_BUTTON_GAP);
        }, 0);
      }

      function updateVisibleMetricCount() {
        const availableRowWidth = metricControlRowElement.clientWidth;
        const allMetricsWidth = getMetricsTotalWidth(trendMetricList);
        let nextVisibleCount = 0;
        let usedWidth = 0;

        if (allMetricsWidth <= availableRowWidth) {
          setVisiblePrimaryMetricCount(function updateCount(previousCount) {
            return previousCount === trendMetricList.length
              ? previousCount
              : trendMetricList.length;
          });
          return;
        }

        const availablePrimaryWidth = Math.max(
          0,
          availableRowWidth - METRIC_SELECT_WIDTH - METRIC_BUTTON_GAP
        );

        for (let index = 0; index < trendMetricList.length; index += 1) {
          const item = trendMetricList[index];
          const metricWidth = getMetricButtonWidth(item);

          if (metricWidth === 0) {
            break;
          }
          const nextUsedWidth =
            index === 0
              ? metricWidth
              : usedWidth + METRIC_BUTTON_GAP + metricWidth;

          if (nextUsedWidth > availablePrimaryWidth) {
            break;
          }

          usedWidth = nextUsedWidth;
          nextVisibleCount += 1;
        }

        setVisiblePrimaryMetricCount(function updateCount(previousCount) {
          return previousCount === nextVisibleCount
            ? previousCount
            : nextVisibleCount;
        });
      }

      let animationFrameId = 0;
      function scheduleVisibleMetricCountUpdate() {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = window.requestAnimationFrame(
          updateVisibleMetricCount
        );
      }

      scheduleVisibleMetricCountUpdate();

      const resizeObserver = new ResizeObserver(
        scheduleVisibleMetricCountUpdate
      );
      resizeObserver.observe(metricControlRowElement);

      return function cleanupResizeObserver() {
        resizeObserver.disconnect();
        window.cancelAnimationFrame(animationFrameId);
      };
    },
    [metricLayoutSignature, trendMetricList.length]
  );

  return (
    <div
      className="w-full h-[320px] bd1 rounded-2xl px-3.5 py-4 flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}>
      <div className="w-full flex items-center mb-3">
        <h3 className="text-sm text-[#9FB5DA]">近30日异常数据报警趋势</h3>
        <div
          className="h-px w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(155, 109, 247, 0.4) 0%, transparent 100%)"
          }}
        />
      </div>
      {/* 选择部分 */}
      <div ref={metricControlRowRef} className="mb-3 flex items-center gap-x-2">
        <div
          ref={primaryMetricRowRef}
          className="flex min-w-0 flex-1 flex-nowrap gap-2 overflow-hidden">
          {primaryMetricList.map(function renderPrimaryMetric(item) {
            return (
              <MetricButton
                key={item.key}
                isActive={item.key === activeMetricKey}
                onClick={function handleClick() {
                  setActiveMetricKey(item.key);
                }}>
                {item.label}
              </MetricButton>
            );
          })}
        </div>
        {secondaryMetricList.length > 0 ? (
          <div className="w-[112px] shrink-0">
            <Select
              value={isActiveMetricInSelect ? activeMetricKey : ""}
              disabled={!hasTrendData}
              onValueChange={function handleValueChange(value) {
                setActiveMetricKey(value);
              }}>
              <SelectTrigger
                className="h-8 w-full min-w-0 rounded-[10px] border border-[#7F69D7]/55 bg-[rgba(12,24,52,0.88)] px-3 text-xs text-[#D6E0F5] hover:bg-[rgba(16,30,61,0.96)]"
                size="sm">
                <SelectValue className="min-w-0 truncate">
                  {isActiveMetricInSelect ? activeMetric.label : "更多指标"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border border-[#7F69D7]/35 bg-[rgba(9,18,38,0.96)] text-[#D6E0F5]">
                {secondaryMetricList.map(function renderSecondaryMetric(item) {
                  return (
                    <SelectItem
                      key={item.key}
                      value={item.key}
                      className="rounded-[8px] text-xs focus:bg-[#776cdb]/18 focus:text-white">
                      {item.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <div className="pointer-events-none invisible fixed -left-[9999px] top-0 flex gap-2">
        {trendMetricList.map(function renderMetricMeasure(item) {
          return (
            <div
              key={item.key}
              ref={function setMetricMeasureElement(element) {
                if (element) {
                  metricMeasureRefs.current.set(item.key, element);
                  return;
                }

                metricMeasureRefs.current.delete(item.key);
              }}>
              <MetricButton isActive={false}>{item.label}</MetricButton>
            </div>
          );
        })}
      </div>
      <div className="flex-1 rounded-2xl border border-[#7F69D7]/18 bg-[rgba(10,23,47,0.45)] px-3 py-3">
        {hasTrendData ? (
          <ScreenLineTrendChart
            dates={dates}
            values={values}
            className="h-full w-full"
          />
        ) : (
          <StatusPlaceholder status={dashboardStatus} error={dashboardError} />
        )}
      </div>
    </div>
  );
}

export default LeftL2;

function StatusPlaceholder({ status, error }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-[#9FB5DA]/85">
      {status === "loading"
        ? "趋势数据加载中..."
        : status === "error"
          ? error?.message || "趋势数据加载失败"
          : "暂无趋势数据"}
    </div>
  );
}

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
      onClick={onClick}>
      {children}
    </Button>
  );
}
