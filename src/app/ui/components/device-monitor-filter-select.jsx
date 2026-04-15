"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shadcn/ui/select";

const deviceOptions = [
  "筛选设备",
  "血脂分析仪 CML-102",
  "血红蛋白分析仪 HBE-102",
  "血红蛋白分析仪 AS-XH-02Pro",
  "血糖血脂分析仪 GKE-10.1",
  "血糖尿酸分析仪 GUE-101",
  "多功能测试仪 DY-8300",
  "多功能测试仪 DY-8600",
  "多功能测试仪 DY-8700",
  "血糖/总胆固醇/甘油三酯/尿酸测试仪 SD-1"
];

/**
 * 设备筛选下拉独立抽离，弹窗内部只做引用。
 */
function DeviceMonitorFilterSelect() {
  return (
    <Select defaultValue="筛选设备">
      <SelectTrigger
        size="sm"
        className="w-[260px] border-[#2452A4]/85 bg-[rgba(12,24,52,0.94)] text-[#D6E0F5] shadow-[inset_0_0_0_1px_rgba(60,106,187,0.15)] hover:bg-[rgba(17,31,61,0.98)]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="start"
        className="max-h-[320px] border border-[#2452A4]/80 bg-[rgba(8,18,40,0.98)] p-1 text-[#D6E0F5] shadow-[0_12px_30px_rgba(2,8,20,0.5)]">
        <SelectGroup className="p-0">
          {deviceOptions.map(function renderDeviceOption(option) {
            return (
              <SelectItem
                key={option}
                value={option}
                className="min-h-9 rounded-[4px] border border-transparent px-3 text-[13px] text-[#DCE7FB] focus:border-[#3A67C5] focus:bg-[rgba(33,73,170,0.35)] focus:text-white">
                {option}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default DeviceMonitorFilterSelect;
