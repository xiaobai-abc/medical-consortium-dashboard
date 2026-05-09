function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function toNumber(value) {
  const normalizedValue =
    typeof value === "string" ? value.replace(/,/g, "") : value;
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
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
  const options = pickArray(source, candidates);

  if (options.length > 0) {
    return options.map(formatOption);
  }

  return fallbackOptions.map(formatOption);
}

export function normalizeServiceOverviewPopup(responseData, fallbackCenterOptions, fallbackRiskOptions) {
  const itemsSource = pickArray(responseData, ["items", "list", "rows"]);

  return {
    centerOptions: normalizeSelectOptions(
      responseData,
      ["center_options", "centerOptions", "filters.center_options", "filters.centers"],
      fallbackCenterOptions
    ),
    riskLevelOptions: normalizeSelectOptions(
      responseData,
      ["risk_level_options", "riskLevelOptions", "filters.risk_level_options", "filters.risk_levels"],
      fallbackRiskOptions
    ),
    items: itemsSource.map(function mapItem(item, index) {
      return {
        id: String(pickFirst(item, ["id", "center_id", "name"], `service-${index + 1}`)),
        centerName: pickFirst(item, ["center_name", "centerName", "name"], "-"),
        serviceCount: toNumber(pickFirst(item, ["service_count", "serviceCount", "count"])) || 0,
        abnormalCount:
          toNumber(pickFirst(item, ["abnormal_count", "abnormalCount", "warning_count"])) || 0,
        riskLevel: pickFirst(item, ["risk_level", "riskLevel", "level"], "-"),
        riskLevelColor:
          pickFirst(item, ["risk_level_color", "riskLevelColor"], "#E8F0FF"),
      };
    }),
  };
}

export function normalizeFollowUpPopup(responseData, fallbackCenterOptions, fallbackMetricOptions, fallbackStatusOptions) {
  const itemsSource = pickArray(responseData, ["items", "list", "rows"]);

  return {
    centerOptions: normalizeSelectOptions(
      responseData,
      ["center_options", "centerOptions", "filters.center_options", "filters.centers"],
      fallbackCenterOptions
    ),
    metricOptions: normalizeSelectOptions(
      responseData,
      ["metric_options", "metricOptions", "filters.metric_options", "filters.metrics"],
      fallbackMetricOptions
    ),
    statusOptions: normalizeSelectOptions(
      responseData,
      ["status_options", "statusOptions", "filters.status_options", "filters.statuses"],
      fallbackStatusOptions
    ),
    items: itemsSource.map(function mapItem(item, index) {
      return {
        id: String(pickFirst(item, ["id", "follow_up_id"], `follow-up-${index + 1}`)),
        centerName: pickFirst(item, ["center_name", "centerName", "hospital_name"], "-"),
        patientName: pickFirst(item, ["patient_name", "patientName"], "-"),
        metricName: pickFirst(item, ["metric_label", "metric_name", "metricName"], "-"),
        statusText: pickFirst(item, ["status_text", "statusText", "follow_up_status"], "-"),
        lastCheckTime: pickFirst(item, ["last_check_time", "lastCheckTime", "time"], "-"),
      };
    }),
  };
}

export function normalizeMeasurementPopup(responseData) {
  const comparisonSource = pickArray(responseData, [
    "comparison_items",
    "comparisonItems",
    "comparison",
    "items",
  ]);

  return {
    totalMeasurements:
      toNumber(pickFirst(responseData, ["total_measurements", "totalMeasurements", "summary.total_measurements"])) || 0,
    abnormalCount:
      toNumber(pickFirst(responseData, ["abnormal_count", "abnormalCount", "summary.abnormal_count"])) || 0,
    normalRatio:
      toNumber(pickFirst(responseData, ["normal_ratio", "normalRatio", "distribution.normal_ratio"])) || 0,
    abnormalRatio:
      toNumber(pickFirst(responseData, ["abnormal_ratio", "abnormalRatio", "distribution.abnormal_ratio"])) || 0,
    normalCount:
      toNumber(pickFirst(responseData, ["normal_count", "normalCount", "distribution.normal_count"])) || 0,
    comparisonItems: comparisonSource.map(function mapItem(item, index) {
      const measurementCount =
        toNumber(pickFirst(item, ["measurement_count", "measurementCount", "count"])) || 0;
      const abnormalCount =
        toNumber(pickFirst(item, ["abnormal_count", "abnormalCount", "warning_count"])) || 0;

      return {
        id: String(pickFirst(item, ["id", "metric_key", "name"], `measurement-${index + 1}`)),
        name: pickFirst(item, ["name", "metric_label", "metric_name", "label"], "-"),
        measurementCount,
        abnormalCount,
      };
    }),
  };
}

export function normalizeWarningDetail(responseData) {
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
