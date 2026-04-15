"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import DeviceMonitorDialog from "./components/device-monitor-dialog";

import LeftL1 from "./left/l1";
import LeftL2 from "./left/l2";

import RightR1 from "./right/r1";
import RightR2 from "./right/r2";

import MainMap from "./middle/map";
import TopDashboard from "./middle/top";

/**
 * 主体
 */

function SectionBody() {
  const [isDeviceMonitorDialogOpen, setIsDeviceMonitorDialogOpen] =
    useState(false);
  const [deviceMonitorDialogType, setDeviceMonitorDialogType] = useState("all");

  function openDeviceMonitorDialog(dialogType) {
    setDeviceMonitorDialogType(dialogType);
    setIsDeviceMonitorDialogOpen(true);
  }

  return (
    <>
      <section className={cn("flex w-full overflow-hidden gap-x-3")}>
        {/* 圣杯布局 */}
        {/* 左 中 右 */}
        <div className="h-full flex flex-col w-[22%] min-w-[420px]">
          <LeftL1 />
          <LeftL2 />
        </div>
        <div className="flex-full w-full h-full flex flex-col">
          <TopDashboard
            onOpenDeviceMonitorDialog={openDeviceMonitorDialog}></TopDashboard>
          <MainMap></MainMap>
        </div>
        <div className="h-full flex flex-col w-[22%] min-w-[420px]">
          <RightR1
            onOpenDeviceMonitorDialog={openDeviceMonitorDialog}></RightR1>
          <RightR2 />
        </div>
      </section>
      <DeviceMonitorDialog
        open={isDeviceMonitorDialogOpen}
        dialogType={deviceMonitorDialogType}
        onOpenChange={() => {
          setIsDeviceMonitorDialogOpen(false);
        }}
      />
    </>
  );
}

export default SectionBody;
