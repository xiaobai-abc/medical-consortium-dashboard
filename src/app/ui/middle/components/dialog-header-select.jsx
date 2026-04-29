"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shadcn/ui/select";

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
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        size="sm"
        className={`h-8 w-fit border-[#1D3B7A]/80 bg-[rgba(13,27,56,0.92)] text-xs font-normal text-[#D6E0F5] hover:bg-[rgba(18,35,70,0.96)] ${minWidthClassName}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border border-[#1D3B7A]/70 bg-[rgba(9,18,38,0.96)] text-[#D6E0F5]">
        <SelectGroup>
          {options.map(function renderOption(option) {
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
  );
}

export default DialogHeaderSelect;
