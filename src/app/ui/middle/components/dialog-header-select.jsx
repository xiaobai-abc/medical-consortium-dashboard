"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shadcn/ui/select";

function getOptionValue(option) {
  if (typeof option === "string") {
    return option;
  }

  /**
   * popup 接口里很多筛选项使用 key + label 结构。
   * 这里优先取 value，其次取 key，最后再回退到 label。
   * 这样像 risk_level = "all" 这类值，展示时才能正确映射到“全部等级”。
   */
  return String(option?.value ?? option?.key ?? option?.label ?? "");
}

function getOptionLabel(option) {
  return typeof option === "string" ? option : String(option?.label ?? option?.value ?? "");
}

function getSelectedOptionLabel(options, value) {
  const selectedOption = options.find(function matchOption(option) {
    return getOptionValue(option) === String(value);
  });

  return selectedOption ? getOptionLabel(selectedOption) : String(value ?? "");
}

/**
 * 表头下拉筛选直接充当列名使用。
 * 这里只提供统一视觉和交互壳子，具体选项仍由业务弹窗各自维护。
 */
function DialogHeaderSelect({
  value,
  options,
  onValueChange,
  minWidthClassName
}) {
  /**
   * 英文 key 只作为请求参数和值匹配使用。
   * 触发器里始终展示中文 label，避免把 all / high 这类值直接露到页面上。
   */
  const selectedLabel = getSelectedOptionLabel(options, value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        size="sm"
        className={`h-8 w-fit border-[#1D3B7A]/80 bg-[rgba(13,27,56,0.92)] text-xs font-normal text-[#D6E0F5] hover:bg-[rgba(18,35,70,0.96)] ${minWidthClassName}`}>
        <SelectValue>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent className="border border-[#1D3B7A]/70 bg-[rgba(9,18,38,0.96)] text-[#D6E0F5]">
        <SelectGroup>
          {options.map(function renderOption(option) {
            return (
              <SelectItem
                key={getOptionValue(option)}
                value={getOptionValue(option)}
                className="rounded-[8px] text-xs focus:bg-[#1D3B7A]/50 focus:text-white">
                {getOptionLabel(option)}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default DialogHeaderSelect;
