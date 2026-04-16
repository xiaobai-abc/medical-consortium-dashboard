"use client";

import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import DeviceMonitorHistoryLineChart from "./history-line-chart";

/**
 * 设备详情弹窗沿用设备监控弹窗壳子，内容区暂时留空。
 */
function DeviceMonitorDetailDialog({ open, onOpenChange, deviceDetail }) {
  const safeDeviceDetail = deviceDetail || {};
  const detailTitle =
    safeDeviceDetail.deviceCode
      ? `设备详情 ${safeDeviceDetail.deviceCode}`
      : "设备详情";
  const historyDates =
    safeDeviceDetail.historyDates ? safeDeviceDetail.historyDates : [];
  const historyValues =
    safeDeviceDetail.historyValues ? safeDeviceDetail.historyValues : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[980px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[980px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col bg-[#1b233a]"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 95%) 0%, rgb(11 21 48 / 85%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              {detailTitle}
            </DialogTitle>
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
          <div className="min-h-[460px]">
            <div className=" grid grid-cols-[1.1fr_1fr] gap-3.5 mb-3">
              <Card title="设备信息">
                <div className="mt-2 space-y-2.5">
                  <PItem l="设备编号" c={safeDeviceDetail.deviceCode}></PItem>
                  <PItem l="设备类型" c={safeDeviceDetail.deviceType}></PItem>
                  <PItem
                    l="设备状态"
                    c={
                      <span className="text-red-400">
                        {safeDeviceDetail.statusText}
                      </span>
                    }></PItem>
                  {/* <PItem l="检测项目" c={safeDeviceDetail.metricName}></PItem> */}
                  <PItem
                    l="最后更新"
                    c={safeDeviceDetail.lastUpdateTime}></PItem>
                </div>
              </Card>
              <Card title="患者信息">
                <div className="mt-2 space-y-2.5">
                  <PItem l="患者姓名" c={safeDeviceDetail.patientName}></PItem>
                  <PItem l="性别" c={safeDeviceDetail.gender}></PItem>
                  <PItem l="年龄" c={safeDeviceDetail.age}></PItem>
                  <PItem l="联系电话" c={safeDeviceDetail.phone}></PItem>
                </div>
              </Card>
              <Card title="医生信息">
                <div className="mt-2 space-y-2.5">
                  <PItem l="医生姓名" c={safeDeviceDetail.doctorName}></PItem>
                  <PItem l="联系电话" c={safeDeviceDetail.doctorPhone}></PItem>
                  {/* <PItem
                    l="最近随访"
                    c={safeDeviceDetail.lastFollowUpTime}></PItem> */}
                </div>
              </Card>
              <Card title="所属医院">
                <div className="mt-2 space-y-2.5">
                  <PItem l="医院名称" c={safeDeviceDetail.hospitalName}></PItem>
                  {/* <PItem l="所属科室" c={safeDeviceDetail.departmentName}></PItem>
                  <PItem l="安装位置" c={safeDeviceDetail.installLocation}></PItem> */}
                </div>
              </Card>
            </div>
            <Card title="历史测量数据(近七天)">
              <div className="h-52 pt-2">
                <DeviceMonitorHistoryLineChart
                  dates={historyDates}
                  values={historyValues}
                  className="h-full w-full"></DeviceMonitorHistoryLineChart>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeviceMonitorDetailDialog;

function Card({ title, children }) {
  return (
    <div className="bg-[#0B1530]/35 rounded-[10px] p-4.5 border border-[#1D3B7A]/55">
      <h6 className="text-sm font-bold text-[#9FB5DA]/95">{title}</h6>
      {children}
    </div>
  );
}

function PItem({ l, c }) {
  return (
    <div className=" flex items-start ">
      <span className="leading-none text-xs text-[#9FB5DA]/95 w-20">{l}</span>
      <p className="flex-1 flex-wrap leading-[16px] text-xs text-[#E8F0FF] font-bold">
        {c}
      </p>
    </div>
  );
}
