"use client";

import ScreenProgress from "@/app/components/screen-progress";
import { useDeviceMonitorDialog } from "@/app/ui/components/device-monitor-dialog/context";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

const HOSPITAL_DEVICE_LIST = [
  {
    id: "hospital-1",
    rank: 1,
    hospitalName: "桐君街道社区卫生服务中心",
    progress: 70,
    deviceCount: 7
  },
  {
    id: "hospital-2",
    rank: 2,
    hospitalName: "仓前街道社区卫生服务中心",
    progress: 64,
    deviceCount: 6
  },
  {
    id: "hospital-3",
    rank: 3,
    hospitalName: "五常街道社区卫生服务中心",
    progress: 58,
    deviceCount: 6
  },
  {
    id: "hospital-4",
    rank: 4,
    hospitalName: "闲林街道社区卫生服务中心",
    progress: 52,
    deviceCount: 5
  },
  {
    id: "hospital-5",
    rank: 5,
    hospitalName: "良渚街道社区卫生服务中心",
    progress: 47,
    deviceCount: 5
  },
  {
    id: "hospital-6",
    rank: 6,
    hospitalName: "瓶窑街道社区卫生服务中心",
    progress: 42,
    deviceCount: 4
  },
  {
    id: "hospital-7",
    rank: 7,
    hospitalName: "仁和街道社区卫生服务中心",
    progress: 38,
    deviceCount: 4
  },
  {
    id: "hospital-8",
    rank: 8,
    hospitalName: "中泰街道社区卫生服务中心",
    progress: 34,
    deviceCount: 3
  },
  {
    id: "hospital-9",
    rank: 9,
    hospitalName: "百丈镇卫生院",
    progress: 28,
    deviceCount: 3
  },
  {
    id: "hospital-10",
    rank: 10,
    hospitalName: "鸬鸟镇卫生院",
    progress: 24,
    deviceCount: 2
  },
  {
    id: "hospital-11",
    rank: 11,
    hospitalName: "径山镇卫生院",
    progress: 20,
    deviceCount: 2
  }
];

/**
 * 右侧医院设备数量榜单，点击行项统一打开设备列表弹窗。
 */
function RightR2() {
  const { openDeviceMonitorDialog } = useDeviceMonitorDialog();

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
          <div className="space-y-3">
            {HOSPITAL_DEVICE_LIST.map(function renderHospitalItem(hospitalItem) {
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
        </ScrollArea>
      </div>
    </div>
  );
}

export default RightR2;

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
