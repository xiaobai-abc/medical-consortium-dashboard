"use client";

import { useState } from "react";

import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

import { useDeviceMonitorDialog } from "./context";
import DeviceMonitorDetailDialog from "./detail-dialog";
import DeviceMonitorFilterSelect from "./filter-select";

const dialogTitleMap = {
  all: "物联网设备监控",
  online: "在线设备数据情况",
  offline: "离线设备",
  total: "设备总数"
};

const deviceSummaryColumns = [
  [
    { label: "设备类型", key: "deviceType" },
    { label: "检测项目", key: "metricName" },
    { label: "所属医院", key: "hospitalName" }
  ],
  [
    { label: "最近更新", key: "lastUpdateTime" },
    { label: "患者姓名", key: "patientName" }
  ]
];

const deviceList = [
  {
    deviceCode: "DEV-100000",
    statusText: "离线",
    statusColor: "#FF4D4F",
    deviceType: "血糖尿酸分析仪 GUE-101",
    metricName: "血糖、尿酸",
    hospitalName: "仓前街道社区卫生服务中心",
    departmentName: "慢病管理科",
    installLocation: "2 号楼 3 层随访室",
    patientName: "张敏",
    gender: "女",
    age: "56 岁",
    phone: "138****5621",
    doctorName: "李医生",
    doctorPhone: "139****2088",
    lastUpdateTime: "2026-04-16 09:12",
    lastFollowUpTime: "2026-04-15 16:30",
    historyDates: [
      "04-10",
      "04-11",
      "04-12",
      "04-13",
      "04-14",
      "04-15",
      "04-16"
    ],
    historyValues: [6.8, 7.1, 6.5, 7.4, 7.0, 6.7, 7.3]
  }
];

/**
 * 设备监控弹窗根组件在页面中只挂载一次，所有入口共享这一份实例。
 */
function DeviceMonitorDialogRoot() {
  const [activeDeviceDetail, setActiveDeviceDetail] = useState(null);
  const { isOpen, dialogType, dialogPayload, closeDeviceMonitorDialog } =
    useDeviceMonitorDialog();
  const dialogTitle =
    dialogPayload?.title || dialogTitleMap[dialogType] || dialogTitleMap.all;
  const detailDialogOpen = Boolean(activeDeviceDetail);

  function clearActiveDeviceDetail() {
    setActiveDeviceDetail(null);
  }

  function handleDialogOpenChange(nextOpen) {
    if (nextOpen) {
      return;
    }

    clearActiveDeviceDetail();
    closeDeviceMonitorDialog();
  }

  function handleDetailOpenChange(nextOpen) {
    if (nextOpen) {
      return;
    }

    clearActiveDeviceDetail();
  }

  function handleDeviceClick(deviceItem) {
    setActiveDeviceDetail(deviceItem);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[980px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[980px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col bg-[#1b233a]"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              {dialogTitle}
            </DialogTitle>
            <div className="ml-auto mr-0">
              <DeviceMonitorFilterSelect />
            </div>
            <div className="pl-3">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    size="xs"
                    className="bg-[#0B1530]/35 rounded-[10px] w-12 h-8 text-xs border-[#1D3B7A]/75 leading-none hover:bg-[#00E7FF]/20 text-[#E8F0FF] font-thin"
                  />
                }>
                关闭
              </DialogClose>
            </div>
          </div>
          <hr className="text-[#1D3B7A]/35 my-3" />
          <ScrollArea className="min-h-[460px]">
            <div>
              {deviceList.map(function renderDeviceCard(deviceItem) {
                return (
                  <DeviceCard
                    key={deviceItem.deviceCode}
                    deviceItem={deviceItem}
                    onClick={handleDeviceClick}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
      <DeviceMonitorDetailDialog
        deviceDetail={activeDeviceDetail}
        open={detailDialogOpen}
        onOpenChange={handleDetailOpenChange}
      />
    </Dialog>
  );
}

export default DeviceMonitorDialogRoot;

function DeviceCard({ deviceItem, onClick }) {
  function handleClick() {
    onClick(deviceItem);
  }

  return (
    <div
      className="py-4.5 px-3.5 border border-[#1D3B7A]/35 rounded-[10px] cursor-pointer transition-colors hover:bg-[rgba(17,31,61,0.48)]"
      onClick={handleClick}>
      <div className="flex items-center justify-between">
        <h6 className="leading-none text-sm text-[#E8F0FF]/95 font-bold">
          {deviceItem.deviceCode}
        </h6>
        <div
          className="flex items-center justify-between px-2 py-1 rounded-[10px]"
          style={{
            border: `1px solid ${deviceItem.statusColor}59`
          }}>
          <span
            className="text-xs leading-none"
            style={{
              color: deviceItem.statusColor
            }}>
            {deviceItem.statusText}
          </span>
        </div>
      </div>
      <div className="flex mt-3">
        {deviceSummaryColumns.map(function renderColumn(columnItems, index) {
          return (
            <div key={index} className="space-y-2.5 flex-1">
              {columnItems.map(function renderItem(item) {
                return (
                  <ItemLab
                    key={item.key}
                    label={item.label}
                    content={deviceItem[item.key]}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemLab({ label, content }) {
  return (
    <div className="flex items-center">
      <span className="text-sm text-[#9FB5DA]/85">{label}:</span>
      <span className="text-sm text-[#E8F0FF]/90 ml-2">{content}</span>
    </div>
  );
}
