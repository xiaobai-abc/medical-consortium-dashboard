/**
 * dashboard-view-model 只处理首页主聚合接口的数据整理。
 *
 * 结构规划约定：
 * - src/api/dashboard*.js: 只负责请求
 * - src/app/modules/dashboard-view-model.js: 只负责首页主接口字段整理
 * - src/app/modules/popup-view-model.js: 只负责各弹窗接口字段整理
 * - src/app/ui/*: 只负责组件渲染和交互
 *
 * 这样后面无论是首页主聚合，还是 popup 继续新增字段，
 * 都可以在“请求层 / 映射层 / 视图层”三层里各改各的，不会互相污染。
 */
const measurementColorPalette = [
  ["#59c2dd", "#55b8d8", "#476fb4"],
  ["#776cdb", "#55b8d8", "#476fb4"],
  ["#59c2dd", "#5dc18c", "#3e8a9f"],
  ["#8b7bff", "#59c2dd", "#476fb4"],
];

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value) {
  const normalizedValue =
    typeof value === "string" ? value.replace(/,/g, "") : value;
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function toDisplayText(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString("zh-CN");
  }

  return String(value);
}

function getObjectByPath(source, path) {
  if (!path) {
    return undefined;
  }

  return path.split(".").reduce(function getNextValue(currentValue, key) {
    if (!currentValue || typeof currentValue !== "object") {
      return undefined;
    }

    return currentValue[key];
  }, source);
}

function pickFirst(source, candidates, fallback = undefined) {
  for (const candidate of candidates) {
    const nextValue = getObjectByPath(source, candidate);

    if (nextValue !== null && nextValue !== undefined && nextValue !== "") {
      return nextValue;
    }
  }

  return fallback;
}

function pickArray(source, candidates) {
  for (const candidate of candidates) {
    const nextValue = getObjectByPath(source, candidate);

    if (Array.isArray(nextValue)) {
      return nextValue;
    }
  }

  return [];
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeOverviewEntries(overview) {
  const arrayOverview = pickArray(overview, ["cards", "items", "list"]);

  if (arrayOverview.length > 0) {
    return arrayOverview;
  }

  if (Array.isArray(overview)) {
    return overview;
  }

  if (!isPlainObject(overview)) {
    return [];
  }

  return Object.entries(overview).map(function mapEntry([key, value]) {
    if (isPlainObject(value)) {
      return {
        key,
        ...value,
      };
    }

    return {
      key,
      value,
    };
  });
}

function matchesEntry(entry, fragments) {
  const searchPool = [
    entry?.key,
    entry?.name,
    entry?.title,
    entry?.label,
    entry?.metric_key,
    entry?.metric_label,
  ]
    .map(normalizeText)
    .join(" ");

  return fragments.every(function hasFragment(fragment) {
    return searchPool.includes(fragment);
  });
}

function findOverviewEntry(entries, matcherGroups) {
  for (const matcherGroup of matcherGroups) {
    const matchedEntry = entries.find(function findEntry(entry) {
      return matchesEntry(entry, matcherGroup);
    });

    if (matchedEntry) {
      return matchedEntry;
    }
  }

  return null;
}

function getOverviewMetricValue(metric) {
  if (!metric) {
    return null;
  }

  const numericValue = toNumber(
    pickFirst(metric, [
      "value",
      "count",
      "total",
      "num",
      "service_count",
      "warning_count",
      "follow_up_count",
      "device_count",
      "completed_count",
    ])
  );

  if (numericValue !== null) {
    return numericValue;
  }

  return pickFirst(metric, ["value", "count", "total"], null);
}

function getMetricDirection(deltaValue) {
  const numericDeltaValue = toNumber(deltaValue);

  if (numericDeltaValue === null || numericDeltaValue === 0) {
    return "flat";
  }

  return numericDeltaValue > 0 ? "up" : "down";
}

function formatPercentLike(value) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return null;
  }

  const absoluteValue = Math.abs(numericValue);
  const normalizedValue = absoluteValue <= 1 ? absoluteValue * 100 : absoluteValue;

  return `${normalizedValue.toFixed(1)}%`;
}

function buildOverviewMeta(metric, fallbackLabel = "较昨日") {
  if (!metric) {
    return {
      label: fallbackLabel,
      value: "-",
      tone: "neutral",
    };
  }

  const completionRate = pickFirst(metric, [
    "completion_rate",
    "completionRate",
    "completion_percent",
  ]);

  if (completionRate !== undefined) {
    return {
      label: "完成率",
      value: formatPercentLike(completionRate) || toDisplayText(completionRate),
      tone: "neutral",
    };
  }

  const explicitText = pickFirst(metric, [
    "change_text",
    "delta_text",
    "compare_text",
    "day_over_day_text",
  ]);

  if (explicitText) {
    return {
      label: pickFirst(metric, ["compare_label", "delta_label"], fallbackLabel),
      value: explicitText,
      tone: explicitText.includes("↑")
        ? "up"
        : explicitText.includes("↓")
          ? "down"
          : "neutral",
    };
  }

  const deltaValue = pickFirst(metric, [
    "day_over_day",
    "day_over_day_rate",
    "delta_rate",
    "change_rate",
    "ratio",
    "rate",
  ]);
  const percentText = formatPercentLike(deltaValue);
  const direction = getMetricDirection(deltaValue);

  return {
    label: pickFirst(metric, ["compare_label", "delta_label"], fallbackLabel),
    value:
      percentText === null
        ? toDisplayText(deltaValue)
        : `${direction === "up" ? "↑" : direction === "down" ? "↓" : ""} ${percentText}`.trim(),
    tone: direction,
  };
}

function buildOverviewCard(metric, options = {}) {
  return {
    value: getOverviewMetricValue(metric),
    valueSuffix: options.valueSuffix || pickFirst(metric, ["unit"], ""),
    meta: buildOverviewMeta(metric, options.metaLabel),
  };
}

function buildMeasurementStatistics(measurementStatistics) {
  const itemsSource = pickArray(measurementStatistics, [
    "items",
    "list",
    "statistics",
    "metrics",
  ]);
  const normalizedItemsSource =
    itemsSource.length > 0
      ? itemsSource
      : isPlainObject(measurementStatistics?.items)
        ? Object.entries(measurementStatistics.items).map(function mapItem(
            [key, value]
          ) {
            return isPlainObject(value)
              ? {
                  key,
                  ...value,
                }
              : {
                  key,
                  value,
                };
          })
        : [];

  const items = normalizedItemsSource.map(function mapItem(item, index) {
    return {
      metricKey: pickFirst(item, ["metric_key", "key"], ""),
      title: pickFirst(item, ["title", "label", "name", "metric_label"], `项目 ${index + 1}`),
      value:
        toNumber(pickFirst(item, ["value", "count", "total", "measurement_count"])) || 0,
      colors: measurementColorPalette[index % measurementColorPalette.length],
    };
  });
  const maxValue = items.reduce(function getMaxValue(currentMaxValue, item) {
    return Math.max(currentMaxValue, item.value);
  }, 0);

  return {
    items: items.map(function mapProgress(item) {
      return {
        ...item,
        progress: maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0,
      };
    }),
    totalMeasurements:
      toNumber(
        pickFirst(measurementStatistics, [
          "total_measurements",
          "total_count",
          "summary.total_measurements",
          "summary.total_count",
        ])
      ) || 0,
    abnormalRatio:
      formatPercentLike(
        pickFirst(measurementStatistics, [
          "abnormal_ratio",
          "abnormal_rate",
          "summary.abnormal_ratio",
          "summary.abnormal_rate",
        ])
      ) || "-",
  };
}

function normalizeTrendPoints(metric) {
  const points = pickArray(metric, ["data", "points", "trend", "items"]);

  if (points.length > 0) {
    return points.map(function mapPoint(point, index) {
      return {
        date: toDisplayText(
          pickFirst(point, ["date", "day", "label", "time"], index + 1)
        ),
        value: toNumber(pickFirst(point, ["value", "count", "total"])) || 0,
      };
    });
  }

  const dates = pickArray(metric, ["dates", "labels"]);
  const values = pickArray(metric, ["values", "counts"]);

  if (dates.length > 0 && values.length > 0) {
    return dates.map(function mapDate(date, index) {
      return {
        date: toDisplayText(date, index + 1),
        value: toNumber(values[index]) || 0,
      };
    });
  }

  return [];
}

function buildWarningTrends(warningTrends) {
  const metricsSource = pickArray(warningTrends, [
    "metrics",
    "items",
    "series",
    "trend_metrics",
  ]);
  const normalizedMetricsSource =
    metricsSource.length > 0
      ? metricsSource
      : isPlainObject(warningTrends?.series)
        ? Object.entries(warningTrends.series).map(function mapMetric(
            [key, value]
          ) {
            return isPlainObject(value)
              ? {
                  key,
                  ...value,
                }
              : {
                  key,
                  values: value,
                };
          })
        : [];
  const metrics = normalizedMetricsSource.map(function mapMetric(metric, index) {
    const data = normalizeTrendPoints(metric);

    return {
      key: pickFirst(metric, ["key", "metric_key", "name"], `metric-${index + 1}`),
      label: pickFirst(metric, ["label", "metric_label", "title", "name"], `指标 ${index + 1}`),
      data,
    };
  });
  const defaultMetricKey = pickFirst(warningTrends, ["default_metric", "defaultMetric"]);
  const hasDefaultMetric = metrics.some(function hasMetric(metric) {
    return metric.key === defaultMetricKey;
  });

  return {
    metrics,
    defaultMetricKey: hasDefaultMetric ? defaultMetricKey : metrics[0]?.key || "",
  };
}

function buildRealtimeWarnings(realtimeWarnings) {
  const itemsSource = pickArray(realtimeWarnings, ["items", "list", "warnings"]);

  return {
    items: itemsSource.map(function mapItem(item, index) {
      return {
        id: pickFirst(item, ["warningId", "id", "uuid"], `warning-${index + 1}`),
        metricName: pickFirst(item, [
          "metric_label",
          "metricName",
          "metric_name",
          "metric_key",
        ], "-"),
        metricValue: pickFirst(item, [
          "metric_value",
          "metricValue",
          "measurement_value",
          "value",
        ], "-"),
        hospitalName: pickFirst(item, [
          "location",
          "hospitalName",
          "hospital_name",
          "institution_name",
          "org_name",
        ], "-"),
        warningTime: pickFirst(item, [
          "warning_time",
          "warningTime",
          "occurred_at",
          "time",
        ], "-"),
        raw: item,
      };
    }),
  };
}

function buildDeviceMonitoring(deviceMonitoring) {
  const rankingsSource = pickArray(deviceMonitoring, [
    "rankings",
    "items",
    "list",
  ]);
  const normalizedRankings = rankingsSource.map(function mapRanking(item, index) {
    const deviceCount =
      toNumber(
        pickFirst(item, [
          "device_count",
          "devices",
          "count",
          "total",
          "managed_device_count",
        ])
      ) || 0;

    return {
      id: pickFirst(item, ["id", "hospital_id", "hospitalName"], `ranking-${index + 1}`),
      rank: toNumber(pickFirst(item, ["rank", "sort"])) || index + 1,
      hospitalName: pickFirst(item, ["hospital_name", "hospitalName", "name"], "-"),
      deviceCount,
      percentage: toNumber(pickFirst(item, ["percentage", "ratio", "rate"])),
    };
  });
  const maxDeviceCount = normalizedRankings.reduce(function getMaxCount(maxCount, item) {
    return Math.max(maxCount, item.deviceCount);
  }, 0);
  const onlineCount =
    toNumber(
      pickFirst(deviceMonitoring, ["online_count", "online_devices", "online"])
    ) || 0;
  const offlineCount =
    toNumber(
      pickFirst(deviceMonitoring, ["offline_count", "offline_devices", "offline"])
    ) || 0;
  const totalCount =
    toNumber(
      pickFirst(deviceMonitoring, ["total_count", "device_total", "total_devices"])
    ) ||
    onlineCount + offlineCount;

  return {
    onlineCount,
    offlineCount,
    totalCount,
    rankings: normalizedRankings.map(function mapProgress(item) {
      return {
        ...item,
        progress:
          Number.isFinite(item.percentage)
            ? Math.round(item.percentage)
            : maxDeviceCount > 0
              ? Math.round((item.deviceCount / maxDeviceCount) * 100)
              : 0,
      };
    }),
  };
}

export function buildHomeDashboardView(dashboardData) {
  const overviewEntries = normalizeOverviewEntries(dashboardData?.overview);
  const realtimeWarnings = buildRealtimeWarnings(dashboardData?.realtime_warnings);
  const deviceMonitoring = buildDeviceMonitoring(dashboardData?.device_monitoring);

  const todayServiceMetric = findOverviewEntry(overviewEntries, [
    ["service", "today"],
    ["today", "service"],
    ["服务", "今日"],
  ]);
  const realtimeWarningMetric = findOverviewEntry(overviewEntries, [
    ["warning"],
    ["预警"],
  ]);
  const followUpMetric = findOverviewEntry(overviewEntries, [
    ["follow", "up"],
    ["follow_up"],
    ["随访"],
  ]);
  const deviceMetric = findOverviewEntry(overviewEntries, [
    ["device"],
    ["设备"],
  ]);

  return {
    top: {
      todayService: buildOverviewCard(todayServiceMetric),
      realtimeWarnings: buildOverviewCard(realtimeWarningMetric || {
        value: realtimeWarnings.items.length,
      }),
      followUp: buildOverviewCard(followUpMetric, {
        valueSuffix: "人",
      }),
      deviceTotal: buildOverviewCard(deviceMetric || {
        value: deviceMonitoring.totalCount,
      }),
    },
    measurementStatistics: buildMeasurementStatistics(
      dashboardData?.measurement_statistics
    ),
    warningTrends: buildWarningTrends(dashboardData?.warning_trends),
    realtimeWarnings,
    deviceMonitoring,
    mapDistribution: dashboardData?.map_distribution || null,
  };
}
