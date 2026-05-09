"use client";

import ScreenProgress from "@/app/components/screen-progress";
import { useDeviceMonitorDialog } from "@/app/ui/components/device-monitor-dialog/context";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

/**
 * 右侧医院设备数量榜单，点击行项统一打开设备列表弹窗。
 */
function RightR2({ deviceMonitoring, dashboardStatus, dashboardError }) {
  const { openDeviceMonitorDialog } = useDeviceMonitorDialog();
  const hospitalDeviceList = deviceMonitoring?.rankings || [];

  return (
    <div
      className="w-full h-[345px] bd1 rounded-2xl px-3.5 py-4 flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}>
      <div className="w-full flex items-center mb-3">
        <h3 className="text-sm text-[#9FB5DA]">辖区各医院管理的设备数量</h3>
        <div
          className="h-px w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
          }}
        />
      </div>
      <div className="flex-1 h-0 -mr-2">
        <ScrollArea className="h-full pr-2">
          {hospitalDeviceList.length > 0 ? (
            <div className="space-y-3">
              {hospitalDeviceList.map(function renderHospitalItem(hospitalItem) {
                return (
                  <Item
                    key={hospitalItem.id}
                    hospitalItem={hospitalItem}
                    onClick={function handleHospitalClick() {
                      openDeviceMonitorDialog("all", {
                        title: `${hospitalItem.hospitalName}设备列表`,
                        hospitalName: hospitalItem.hospitalName
                      });
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <StatusPlaceholder status={dashboardStatus} error={dashboardError} />
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default RightR2;

function StatusPlaceholder({ status, error }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#1E4B87]/50 text-sm text-[#9FB5DA]/85">
      {status === "loading"
        ? "设备榜单加载中..."
        : status === "error"
          ? error?.message || "设备榜单加载失败"
          : "暂无设备榜单数据"}
    </div>
  );
}

/**
 * 医院设备数量行项，点击时跳转到统一设备列表弹窗。
 */
function Item({ hospitalItem, onClick }) {
  return (
    <button
      type="button"
      className="w-full text-left flex items-center cursor-pointer transition-colors hover:bg-[rgba(17,31,61,0.48)] rounded-[10px] px-1.5 py-1.5"
      onClick={onClick}>
      <div className=" rounded-[5px] text-white text-sm flex items-center justify-center w-6 h-6 bg-[#2E5E59] leading-[10px] font-bold">
        {hospitalItem.rank}
      </div>
      <div className="flex-1 ml-3 mr-3">
        <span className="text-sm text-[#B7D7EA]">
          {hospitalItem.hospitalName}
        </span>
        <ScreenProgress
          progress={hospitalItem.progress}
          colors="#6bc8fa"
          className="h-1 mt-1"></ScreenProgress>
      </div>
      <span className="text-sm text-[#DDF7FF]">
        {hospitalItem.deviceCount}台
      </span>
    </button>
  );
}
