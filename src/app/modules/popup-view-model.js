/**
 * popup-view-model 专门负责“接口数据 -> 弹窗视图数据”的轻量整理。
 *
 * 这里故意不放请求逻辑，也不放 UI 组件。
 * 这样做的目的有两点：
 * 1. 后端字段变动时，只改这一层就能稳定弹窗组件。
 * 2. 避免复用型弹窗组件里堆满字段兼容代码，影响后续维护。
 *
 * 检测项目弹窗的结构已经稳定，而且只在 l1.jsx 使用。
 * 那条链路现在直接在组件内整理数据，方便联调时顺着请求和 UI 一路往下看。
 */
function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function toNumber(value) {
  const normalizedValue =
    typeof value === "string" ? value.replace(/,/g, "") : value;
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
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

function formatOption(option, index) {
  if (isPlainObject(option)) {
    return {
      label: String(
        pickFirst(option, ["label", "name", "title", "text"], `选项 ${index + 1}`)
      ),
      value: String(
        pickFirst(option, ["value", "key", "code", "id", "label"], index + 1)
      ),
    };
  }

  return {
    label: String(option),
    value: String(option),
  };
}

export function normalizeSelectOptions(source, candidates, fallbackOptions = []) {
  /**
   * 大部分 popup 都会返回筛选项 options。
   * 这里统一转成 { label, value }，供 Select 组件复用。
   */
  const options = pickArray(source, candidates);

  if (options.length > 0) {
    return options.map(formatOption);
  }

  return fallbackOptions.map(formatOption);
}

export function normalizeServiceOverviewPopup(responseData, fallbackCenterOptions, fallbackRiskOptions) {
  /**
   * “今日总服务人次”弹窗已经有真实接口结构，这里按实际返回字段整理。
   *
   * 当前确认过的字段：
   * - filters.center_options
   * - filters.risk_level_options
   * - items
   *
   * 其中：
   * - center_options 是字符串数组
   * - risk_level_options 是对象数组，包含 key / label / color
   * - items 是列表数据；当前样例为空数组，行字段先按这条接口语义直接收口
   */
  const filterConfig = responseData?.filters || {};
  const centerOptions = Array.isArray(filterConfig?.center_options)
    ? filterConfig.center_options
    : [];
  const riskLevelOptions = Array.isArray(filterConfig?.risk_level_options)
    ? filterConfig.risk_level_options
    : [];
  const itemsSource = Array.isArray(responseData?.items) ? responseData.items : [];

  return {
    centerOptions:
      centerOptions.length > 0
        ? centerOptions.map(function mapCenterOption(option, index) {
            if (typeof option === "string" && option === "全部卫生中心") {
              return {
                label: option,
                value: "",
              };
            }

            return formatOption(option, index);
          })
        : fallbackCenterOptions.map(formatOption),
    riskLevelOptions:
      riskLevelOptions.length > 0
        ? riskLevelOptions.map(function mapRiskLevelOption(option, index) {
            return {
              label: String(option?.label || `选项 ${index + 1}`),
              value: String(option?.key || option?.label || index + 1),
            };
          })
        : fallbackRiskOptions.map(formatOption),
    items: itemsSource.map(function mapItem(item, index) {
      return {
        id: String(item?.center_id || item?.center_name || `service-${index + 1}`),
        centerName: item?.center_name || "-",
        serviceCount: toNumber(item?.service_count) || 0,
        abnormalCount: toNumber(item?.abnormal_count) || 0,
        riskLevel: item?.risk_level_label || item?.risk_level || "-",
        riskLevelColor: item?.risk_level_color || "#E8F0FF",
      };
    }),
  };
}

export function normalizeFollowUpPopup(responseData, fallbackCenterOptions, fallbackMetricOptions, fallbackStatusOptions) {
  /**
   * 重点随访弹窗已经有真实接口结构，这里按实际返回字段整理。
   * 当前确认过的字段：
   * - filters.search_placeholder
   * - filters.center_options
   * - filters.metric_options
   * - filters.status_options
   * - items
   */
  const filterConfig = responseData?.filters || {};
  const centerOptions = Array.isArray(filterConfig?.center_options)
    ? filterConfig.center_options
    : [];
  const metricOptions = Array.isArray(filterConfig?.metric_options)
    ? filterConfig.metric_options
    : [];
  const statusOptions = Array.isArray(filterConfig?.status_options)
    ? filterConfig.status_options
    : [];
  const itemsSource = Array.isArray(responseData?.items) ? responseData.items : [];

  return {
    searchPlaceholder:
      filterConfig?.search_placeholder || "搜索患者姓名、社区...",
    centerOptions:
      centerOptions.length > 0
        ? centerOptions.map(function mapCenterOption(option, index) {
            if (typeof option === "string" && option === "全部卫生中心") {
              return {
                label: option,
                value: "",
              };
            }

            return formatOption(option, index);
          })
        : fallbackCenterOptions.map(formatOption),
    metricOptions:
      metricOptions.length > 0
        ? metricOptions.map(function mapMetricOption(option, index) {
            return {
              label: String(option?.label || `选项 ${index + 1}`),
              value: String(option?.key ?? ""),
            };
          })
        : fallbackMetricOptions.map(formatOption),
    statusOptions:
      statusOptions.length > 0
        ? statusOptions.map(function mapStatusOption(option, index) {
            return {
              label: String(option?.label || `选项 ${index + 1}`),
              value: String(option?.key || option?.label || index + 1),
            };
          })
        : fallbackStatusOptions.map(formatOption),
    items: itemsSource.map(function mapItem(item, index) {
      return {
        id: String(item?.id || item?.patient_openid || `follow-up-${index + 1}`),
        centerName: item?.center_name || "-",
        patientName: item?.patient_name || "-",
        metricName: item?.metric_name || "-",
        statusText: item?.status_text || "-",
        lastCheckTime: item?.last_check_time || "-",
      };
    }),
  };
}

export function normalizeWarningDetail(responseData) {
  /**
   * 预警详情接口通常会把患者、医生、历史曲线拆在不同字段里。
   * 这里把这些分散字段拍平成弹窗直接可读的结构。
   */
  const patientInfo = pickFirst(responseData, ["patient_info", "patientInfo"], {});
  const doctorInfo = pickFirst(responseData, ["doctor_info", "doctorInfo"], {});
  const history = pickFirst(responseData, ["history", "measurement_history"], {});
  const historyPoints = pickArray(history, ["points", "items", "data"]);

  return {
    warningLevel: pickFirst(responseData, ["warning_level", "warningLevel", "level"], "-"),
    warningLevelColor: pickFirst(responseData, ["warning_level_color", "warningLevelColor"], "#FFCC66"),
    occurredAt: pickFirst(responseData, ["occurred_at", "warning_time", "warningTime"], "-"),
    metricLabel: pickFirst(responseData, ["metric_label", "metricName", "metric_name"], "-"),
    measurementValue: pickFirst(responseData, ["metric_value", "metricValue", "measurement_value"], "-"),
    location: pickFirst(responseData, ["location", "hospital_name", "hospitalName"], "-"),
    warningId: pickFirst(responseData, ["warningId", "warning_id", "id"], "-"),
    patientName: pickFirst(patientInfo, ["patient_name", "name"], "-"),
    patientGender: pickFirst(patientInfo, ["gender"], "-"),
    patientAge: pickFirst(patientInfo, ["age"], "-"),
    patientPhone: pickFirst(patientInfo, ["phone", "mobile"], "-"),
    doctorName: pickFirst(doctorInfo, ["doctor_name", "name"], "-"),
    doctorPhone: pickFirst(doctorInfo, ["phone", "mobile"], "-"),
    historyDates: historyPoints.map(function mapPoint(point, index) {
      return String(pickFirst(point, ["date", "day", "time"], index + 1));
    }),
    historyValues: historyPoints.map(function mapPoint(point) {
      return toNumber(pickFirst(point, ["value", "measurement_value", "count"])) || 0;
    }),
  };
}

export function normalizeDeviceListPopup(responseData, fallbackTitle) {
  /**
   * 设备列表弹窗需要兼顾多入口：
   * - 查看全部
   * - 在线设备
   * - 离线设备
   * - 设备总数
   * - 医院排行点击
   * 标题和筛选项都可能由接口动态返回，所以统一在这里收口。
   */
  const itemsSource = pickArray(responseData, ["items", "list", "devices"]);

  return {
    title: pickFirst(responseData, ["title"], fallbackTitle),
    deviceOptions: normalizeSelectOptions(
      responseData,
      ["device_type_options", "deviceTypeOptions", "filters.device_type_options", "filters.device_types"],
      [{ label: "筛选设备", value: "" }]
    ),
    items: itemsSource.map(function mapItem(item, index) {
      return {
        deviceCode: pickFirst(item, ["device_code", "deviceCode", "code"], `DEV-${index + 1}`),
        statusText: pickFirst(item, ["status_text", "statusText", "device_status"], "-"),
        statusColor: pickFirst(item, ["status_color", "statusColor"], "#FF4D4F"),
        deviceType: pickFirst(item, ["device_type", "deviceType"], "-"),
        metricName: pickFirst(item, ["metric_label", "metricName", "metric_name"], "-"),
        hospitalName: pickFirst(item, ["hospital_name", "hospitalName"], "-"),
        lastUpdateTime: pickFirst(item, ["last_update_time", "lastUpdateTime"], "-"),
        patientName: pickFirst(item, ["patient_name", "patientName"], "-"),
      };
    }),
  };
}

export function normalizeDeviceDetail(responseData) {
  /**
   * 设备详情和预警详情很像，都是“基础信息 + 人员信息 + 历史曲线”。
   * 区别只是字段命名不同，所以单独保留一个解析函数，避免两边耦合。
   */
  const patientInfo = pickFirst(responseData, ["patient_info", "patientInfo"], {});
  const doctorInfo = pickFirst(responseData, ["doctor_info", "doctorInfo"], {});
  const history = pickFirst(responseData, ["history", "measurement_history"], {});
  const historyPoints = pickArray(history, ["points", "items", "data"]);

  return {
    deviceCode: pickFirst(responseData, ["device_code", "deviceCode"], "-"),
    statusText: pickFirst(responseData, ["status_text", "statusText"], "-"),
    statusColor: pickFirst(responseData, ["status_color", "statusColor"], "#FF4D4F"),
    deviceType: pickFirst(responseData, ["device_type", "deviceType"], "-"),
    metricName: pickFirst(responseData, ["metric_label", "metricName", "metric_name"], "-"),
    hospitalName: pickFirst(responseData, ["hospital_name", "hospitalName"], "-"),
    lastUpdateTime: pickFirst(responseData, ["last_update_time", "lastUpdateTime"], "-"),
    patientName: pickFirst(patientInfo, ["patient_name", "name"], "-"),
    gender: pickFirst(patientInfo, ["gender"], "-"),
    age: pickFirst(patientInfo, ["age"], "-"),
    phone: pickFirst(patientInfo, ["phone", "mobile"], "-"),
    doctorName: pickFirst(doctorInfo, ["doctor_name", "name"], "-"),
    doctorPhone: pickFirst(doctorInfo, ["phone", "mobile"], "-"),
    historyDates: historyPoints.map(function mapPoint(point, index) {
      return String(pickFirst(point, ["date", "day", "time"], index + 1));
    }),
    historyValues: historyPoints.map(function mapPoint(point) {
      return toNumber(pickFirst(point, ["value", "measurement_value", "count"])) || 0;
    }),
  };
}
