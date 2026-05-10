"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shadcn/ui/select";

const defaultDeviceOptions = [{ label: "筛选设备", value: "" }];

function getOptionValue(option) {
  if (typeof option === "string") {
    return option;
  }

  /**
   * 这里要保留空字符串 value。
   * “筛选设备”这类默认项依赖 value="" 参与请求，不能被 || 吞掉。
   */
  return String(option?.value ?? option?.label ?? "");
}

function getOptionLabel(option) {
  return typeof option === "string" ? option : String(option?.label ?? option?.value ?? "");
}

function getSelectedOptionLabel(options, value) {
  const selectedOption = options.find(function matchOption(option) {
    return getOptionValue(option) === String(value);
  });

  return selectedOption ? getOptionLabel(selectedOption) : "";
}

/**
 * 设备筛选下拉独立抽离，弹窗根组件只负责引用。
 */
function DeviceMonitorFilterSelect({ value = "", options, onValueChange }) {
  const normalizedOptions = Array.isArray(options) && options.length > 0
    ? options
    : defaultDeviceOptions;
  const selectedLabel = getSelectedOptionLabel(normalizedOptions, value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        size="sm"
        className="w-[260px] border-[#2452A4]/85 bg-[rgba(12,24,52,0.94)] text-[#D6E0F5] shadow-[inset_0_0_0_1px_rgba(60,106,187,0.15)] hover:bg-[rgba(17,31,61,0.98)]">
        <SelectValue placeholder="筛选设备">{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        className="max-h-[320px] border border-[#2452A4]/80 bg-[rgba(8,18,40,0.98)] p-1 text-[#D6E0F5] shadow-[0_12px_30px_rgba(2,8,20,0.5)]">
        <SelectGroup className="p-0">
          {normalizedOptions.map(function renderDeviceOption(option) {
            return (
              <SelectItem
                key={getOptionValue(option)}
                value={getOptionValue(option)}
                className="min-h-9 rounded-[4px] border border-transparent px-3 text-[13px] text-[#DCE7FB] focus:border-[#3A67C5] focus:bg-[rgba(33,73,170,0.35)] focus:text-white">
                {getOptionLabel(option)}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default DeviceMonitorFilterSelect;
